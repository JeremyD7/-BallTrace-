import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_POST_MEDIA,
  MAX_POST_TAGS,
  POST_STATUS_PUBLISHED,
  POST_VISIBILITY_PUBLIC,
} from './community.constants';
import {
  mapComment,
  mapPostDetail,
  mapPostListItem,
} from './community.mapper';
import { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { QueryCommunityPostsDto } from './dto/query-community-posts.dto';

const POST_INCLUDE = {
  author: true,
  media: {
    orderBy: {
      sort: 'asc',
    },
  },
  tags: {
    orderBy: {
      sort: 'asc',
    },
  },
} satisfies Prisma.CommunityPostInclude;

const COMMENT_INCLUDE = {
  author: true,
  replies: {
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.CommunityCommentInclude;

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async getPosts(query: QueryCommunityPostsDto) {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = Math.min(query.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const keyword = query.keyword?.trim();
    const where = this.buildPostWhere(keyword);
    const orderBy = this.buildPostOrder(query.tab);

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.communityPost.count({ where }),
      this.prisma.communityPost.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: POST_INCLUDE,
      }),
    ]);

    return {
      items: posts.map(mapPostListItem),
      page,
      pageSize,
      total,
    };
  }

  async searchPosts(keyword = '') {
    return this.getPosts({
      keyword,
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  }

  async getPostDetail(postId: number) {
    const post = await this.prisma.communityPost.findFirst({
      where: {
        id: postId,
        status: POST_STATUS_PUBLISHED,
        visibility: POST_VISIBILITY_PUBLIC,
      },
      include: POST_INCLUDE,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return mapPostDetail(post);
  }

  async createPost(userId: number, payload: CreateCommunityPostDto) {
    const tags = this.normalizeTags(payload.tags);
    const media = this.normalizeMedia(payload.media);

    const post = await this.prisma.communityPost.create({
      data: {
        userId,
        title: payload.title.trim(),
        content: payload.content.trim(),
        location: payload.location?.trim() || null,
        visibility: payload.visibility ?? POST_VISIBILITY_PUBLIC,
        allowComment: payload.allowComment ?? true,
        syncToCommunity: payload.syncToCommunity ?? true,
        ...(media.length > 0
          ? {
              media: {
                create: media.map((item, sort) => ({
                  url: item.url,
                  type: item.type,
                  sort,
                })),
              },
            }
          : {}),
        ...(tags.length > 0
          ? {
              tags: {
                create: tags.map((name, sort) => ({
                  name,
                  sort,
                })),
              },
            }
          : {}),
      },
      include: POST_INCLUDE,
    });

    return mapPostDetail(post);
  }

  async toggleLike(postId: number, userId: number) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.communityPostLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      if (existingLike) {
        await tx.communityPostLike.delete({
          where: { id: existingLike.id },
        });

        const updatedPost = await tx.communityPost.update({
          where: { id: postId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
          select: {
            likeCount: true,
          },
        });

        return {
          isLiked: false,
          likes: Math.max(updatedPost.likeCount, 0),
        };
      }

      await tx.communityPostLike.create({
        data: {
          postId,
          userId,
        },
      });

      const updatedPost = await tx.communityPost.update({
        where: { id: postId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
        select: {
          likeCount: true,
        },
      });

      return {
        isLiked: true,
        likes: updatedPost.likeCount,
      };
    });
  }

  async getComments(postId: number) {
    await this.ensurePostExists(postId);

    const comments = await this.prisma.communityComment.findMany({
      where: {
        postId,
        parentId: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: COMMENT_INCLUDE,
    });

    return comments.map(mapComment);
  }

  async createComment(
    postId: number,
    userId: number,
    payload: CreateCommunityCommentDto,
  ) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        allowComment: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.allowComment) {
      throw new BadRequestException('Comments are disabled for this post');
    }

    if (payload.parentId) {
      await this.ensureParentComment(postId, payload.parentId);
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const createdComment = await tx.communityComment.create({
        data: {
          postId,
          userId,
          parentId: payload.parentId ?? null,
          content: payload.content.trim(),
        },
        include: COMMENT_INCLUDE,
      });

      await tx.communityPost.update({
        where: { id: postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });

      return createdComment;
    });

    return mapComment(comment);
  }

  private buildPostWhere(keyword?: string): Prisma.CommunityPostWhereInput {
    const where: Prisma.CommunityPostWhereInput = {
      status: POST_STATUS_PUBLISHED,
      syncToCommunity: true,
      visibility: POST_VISIBILITY_PUBLIC,
    };

    if (!keyword) {
      return where;
    }

    return {
      ...where,
      OR: [
        {
          title: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          author: {
            is: {
              nickname: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          author: {
            is: {
              account: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          tags: {
            some: {
              name: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    };
  }

  private buildPostOrder(tab?: QueryCommunityPostsDto['tab']) {
    if (tab === 'hot') {
      return [
        { likeCount: 'desc' },
        { commentCount: 'desc' },
        { createdAt: 'desc' },
      ] satisfies Prisma.CommunityPostOrderByWithRelationInput[];
    }

    return [
      {
        createdAt: 'desc',
      },
    ] satisfies Prisma.CommunityPostOrderByWithRelationInput[];
  }

  private normalizeTags(tags: string[] = []) {
    const normalizedTags = tags
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean);

    return [...new Set(normalizedTags)].slice(0, MAX_POST_TAGS);
  }

  private normalizeMedia(media: CreateCommunityPostDto['media'] = []) {
    return media
      .map((item) => ({
        url: item.url.trim(),
        type: item.type?.trim() || 'image',
      }))
      .filter((item) => item.url)
      .slice(0, MAX_POST_MEDIA);
  }

  private async ensurePostExists(postId: number) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }

  private async ensureParentComment(postId: number, parentId: number) {
    const parent = await this.prisma.communityComment.findFirst({
      where: {
        id: parentId,
        postId,
        parentId: null,
      },
      select: {
        id: true,
      },
    });

    if (!parent) {
      throw new BadRequestException('Invalid parent comment');
    }
  }
}
