import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapPostListItem } from '../community/community.mapper';

const DEFAULT_STATS = [
  { label: 'Likes', value: '2.3k' },
  { label: 'Following', value: '128' },
  { label: 'Fans', value: '482' },
];

const DEFAULT_TAGS = [
  'Basketball',
  'Night court',
  'Weekend games',
  'Shooting practice',
];

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.seedProfile(userId);

    const [stats, tags, communityPosts, savedPosts] = await Promise.all([
      this.prisma.profileStat.findMany({
        where: { userId },
        orderBy: { sort: 'asc' },
      }),
      this.prisma.profileTag.findMany({
        where: { userId },
        orderBy: { sort: 'asc' },
      }),
      this.prisma.communityPost.findMany({
        where: { userId, status: 'published' },
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          media: {
            orderBy: { sort: 'asc' },
          },
          tags: {
            orderBy: { sort: 'asc' },
          },
        },
      }),
      this.prisma.profilePost.findMany({
        where: { userId, kind: 'saved' },
        orderBy: { sort: 'asc' },
      }),
    ]);

    const posts = [
      ...communityPosts.map((post) => ({
        ...mapPostListItem(post),
        kind: 'post' as const,
      })),
      ...savedPosts.map(({ id, cover }) => ({
        id,
        cover,
        kind: 'saved' as const,
      })),
    ];

    return {
      user: {
        id: user.id,
        account: user.account,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
      stats: stats.map(({ label, value }) => ({ label, value })),
      tags: tags.map((tag) => tag.name),
      posts,
    };
  }

  private async seedProfile(userId: number) {
    const count = await this.prisma.profileStat.count({ where: { userId } });

    if (count > 0) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.profileStat.createMany({
        data: DEFAULT_STATS.map((item, sort) => ({ ...item, sort, userId })),
      }),
      this.prisma.profileTag.createMany({
        data: DEFAULT_TAGS.map((name, sort) => ({ name, sort, userId })),
      }),
    ]);
  }
}
