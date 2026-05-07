import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { QueryMatchesDto } from './dto/query-matches.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const MATCH_INCLUDE = {
  author: {
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
    },
  },
  participants: {
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.MatchInclude;

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatches(query: QueryMatchesDto) {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = Math.min(query.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const keyword = query.keyword?.trim();
    const area = query.area?.trim();

    const where = this.buildMatchWhere(keyword, area);

    const [total, matches] = await this.prisma.$transaction([
      this.prisma.match.count({ where }),
      this.prisma.match.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: MATCH_INCLUDE,
      }),
    ]);

    return {
      items: matches.map((match) => this.mapMatchItem(match)),
      page,
      pageSize,
      total,
    };
  }

  async getMatchDetail(matchId: number) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: MATCH_INCLUDE,
    });

    if (!match) {
      throw new NotFoundException('约球不存在');
    }

    return this.mapMatchDetail(match);
  }

  async createMatch(userId: number, payload: CreateMatchDto) {
    const match = await this.prisma.$transaction(async (tx) => {
      const createdMatch = await tx.match.create({
        data: {
          userId,
          area: payload.area.trim(),
          courtName: payload.courtName.trim(),
          matchDate: payload.matchDate.trim(),
          startTime: payload.startTime.trim(),
          endTime: payload.endTime.trim(),
          matchType: payload.matchType,
          level: payload.level,
          genderLimit: payload.genderLimit ?? '不限男女',
          total: payload.total ?? 4,
          price: payload.price?.trim() ?? '',
          feeRule: payload.feeRule?.trim() ?? '',
          slogan: payload.slogan.trim(),
          note: payload.note?.trim() || null,
        },
        include: MATCH_INCLUDE,
      });

      await tx.matchParticipant.create({
        data: {
          matchId: createdMatch.id,
          userId,
          role: 'organizer',
        },
      });

      return createdMatch;
    });

    return this.mapMatchDetail(match);
  }

  async applyMatch(matchId: number, userId: number) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { participants: true },
    });

    if (!match) {
      throw new NotFoundException('约球不存在');
    }

    if (match.status !== 'recruiting') {
      throw new BadRequestException('约球已截止报名');
    }

    const joinedCount = match.participants.filter((p) => p.status === 'joined').length;
    if (joinedCount >= match.total) {
      throw new BadRequestException('约球已满员');
    }

    const existingParticipant = match.participants.find((p) => p.userId === userId);
    if (existingParticipant) {
      throw new BadRequestException('您已报名此约球');
    }

    await this.prisma.matchParticipant.create({
      data: {
        matchId,
        userId,
        role: 'participant',
      },
    });

    return { success: true };
  }

  private buildMatchWhere(keyword?: string, area?: string): Prisma.MatchWhereInput {
    const where: Prisma.MatchWhereInput = {
      status: 'recruiting',
    };

    if (area) {
      where.area = {
        contains: area,
        mode: 'insensitive',
      };
    }

    if (!keyword) {
      return where;
    }

    return {
      ...where,
      OR: [
        { courtName: { contains: keyword, mode: 'insensitive' } },
        { slogan: { contains: keyword, mode: 'insensitive' } },
        { author: { nickname: { contains: keyword, mode: 'insensitive' } } },
      ],
    };
  }

  private mapMatchItem(match: Prisma.MatchGetPayload<{ include: typeof MATCH_INCLUDE }>) {
    const joined = match.participants.filter((p) => p.status === 'joined').length;
    const tags = this.buildTags(match);

    return {
      id: match.id,
      author: match.author.nickname || match.author.id.toString(),
      time: this.formatTime(match.createdAt),
      status: match.status === 'recruiting' ? '招募中' : '已结束',
      title: `${match.area} ${match.matchDate} ${match.startTime}-${match.endTime}`,
      tags,
      slogan: match.slogan,
      location: match.courtName,
      schedule: `${match.area} · ${match.matchDate} · ${match.startTime}-${match.endTime}`,
      joined,
      total: match.total,
      price: match.price,
      type: match.matchType,
      level: match.level,
      feeRule: match.feeRule,
      avatar: match.author.avatarUrl,
      createdAt: match.createdAt.toISOString(),
    };
  }

  private mapMatchDetail(match: Prisma.MatchGetPayload<{ include: typeof MATCH_INCLUDE }>) {
    const joined = match.participants.filter((p) => p.status === 'joined').length;
    const tags = this.buildTags(match);

    return {
      id: match.id,
      author: match.author.nickname || match.author.id.toString(),
      time: this.formatTime(match.createdAt),
      status: match.status === 'recruiting' ? '招募中' : '已结束',
      title: `${match.area} ${match.matchDate} ${match.startTime}-${match.endTime}`,
      tags,
      slogan: match.slogan,
      location: match.courtName,
      schedule: `${match.area} · ${match.matchDate} · ${match.startTime}-${match.endTime}`,
      joined,
      total: match.total,
      price: match.price,
      type: match.matchType,
      level: match.level,
      feeRule: match.feeRule,
      note: match.note || '',
      avatar: match.author.avatarUrl,
      participants: match.participants.map((p) => ({
        id: p.userId,
        name: p.user.nickname || p.userId.toString(),
        score: '--',
        role: p.role === 'organizer' ? '组织者' : '',
        avatar: p.user.avatarUrl,
      })),
      createdAt: match.createdAt.toISOString(),
    };
  }

  private buildTags(match: Prisma.MatchGetPayload<{ include: typeof MATCH_INCLUDE }>) {
    const tags: string[] = [];
    tags.push(match.matchType);
    tags.push(`水平:${match.level}`);
    if (match.genderLimit && match.genderLimit !== '不限男女') {
      tags.push(match.genderLimit);
    }
    return tags;
  }

  private formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  }
}