import { Prisma } from '@prisma/client';
import { DEFAULT_AVATAR, DEFAULT_POST_COVER } from './community.constants';

export type CommunityPostRecord = Prisma.CommunityPostGetPayload<{
  include: {
    author: true;
    media: true;
    tags: true;
  };
}>;

export type CommunityCommentRecord = Prisma.CommunityCommentGetPayload<{
  include: {
    author: true;
    replies: {
      include: {
        author: true;
      };
    };
  };
}>;

function getAuthorName(author: { account: string; nickname: string | null }) {
  return author.nickname?.trim() || author.account;
}

function getAvatar(author: { avatarUrl: string | null }) {
  return author.avatarUrl || DEFAULT_AVATAR;
}

function getCover(post: CommunityPostRecord) {
  return post.media[0]?.url || DEFAULT_POST_COVER;
}

export function mapPostListItem(post: CommunityPostRecord) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: getAuthorName(post.author),
    avatar: getAvatar(post.author),
    cover: getCover(post),
    media: post.media.map((item) => ({
      url: item.url,
      type: item.type,
    })),
    likes: post.likeCount,
    comments: post.commentCount,
    tags: post.tags.map((tag) => tag.name),
    publishedAt: post.createdAt,
  };
}

export function mapPostDetail(post: CommunityPostRecord, isLiked = false) {
  const coverImages = post.media.map((item) => item.url);

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: {
      id: post.author.id,
      name: getAuthorName(post.author),
      avatar: getAvatar(post.author),
    },
    coverImages: coverImages.length > 0 ? coverImages : [DEFAULT_POST_COVER],
    media: post.media.map((item) => ({
      url: item.url,
      type: item.type,
    })),
    likes: post.likeCount,
    comments: post.commentCount,
    shares: post.shareCount,
    isLiked,
    tags: post.tags.map((tag) => tag.name),
    publishedAt: post.createdAt,
    location: post.location,
    allowComment: post.allowComment,
  };
}

export function mapComment(comment: CommunityCommentRecord) {
  return {
    id: comment.id,
    author: {
      id: comment.author.id,
      name: getAuthorName(comment.author),
      avatar: getAvatar(comment.author),
    },
    content: comment.content,
    likes: comment.likeCount,
    publishedAt: comment.createdAt,
    replies: comment.replies.map((reply) => ({
      id: reply.id,
      authorName: getAuthorName(reply.author),
      content: reply.content,
    })),
  };
}
