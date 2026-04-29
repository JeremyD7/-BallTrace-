import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

const DEFAULT_POSTS = [
  { cover: '/static/images/art_theman.jpg', kind: 'post' },
  { cover: '/static/images/art_thewoman.jpg', kind: 'post' },
  { cover: '/static/images/art_frommoon.jpg', kind: 'post' },
  { cover: '/static/images/theman02.jpg', kind: 'saved' },
  { cover: '/static/images/earth.jpg', kind: 'saved' },
  { cover: '/static/images/art_theman.jpg', kind: 'saved' },
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

    const [stats, tags, posts] = await Promise.all([
      this.prisma.profileStat.findMany({
        where: { userId },
        orderBy: { sort: 'asc' },
      }),
      this.prisma.profileTag.findMany({
        where: { userId },
        orderBy: { sort: 'asc' },
      }),
      this.prisma.profilePost.findMany({
        where: { userId },
        orderBy: { sort: 'asc' },
      }),
    ]);

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
      posts: posts.map(({ id, cover, kind }) => ({ id, cover, kind })),
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
      this.prisma.profilePost.createMany({
        data: DEFAULT_POSTS.map((item, sort) => ({ ...item, sort, userId })),
      }),
    ]);
  }
}
