import { Injectable } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SseGateway } from './sse.gateway';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

export type NotificationType = 'follow' | 'like' | 'comment' | 'collect' | 'match_apply' | 'match_approved' | 'match_rejected';

export interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  sourceType: string;
  sourceId: number;
  actorId: number;
  actorName: string;
  actorAvatar?: string | null;
  title: string;
  content?: string;
  metadata?: Record<string, any>;
}

interface NotificationWhere {
  userId: number;
  type?: string;
  status?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseGateway: SseGateway,
  ) {}

  async getNotifications(userId: number, query: QueryNotificationsDto) {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = Math.min(query.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const where: NotificationWhere = { userId };
    if (query.type) {
      where.type = query.type;
    }

    const [total, notifications] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: notifications.map(this.mapNotification),
      page,
      pageSize,
      total,
    };
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, status: 'unread' },
    });
    return { count };
  }

  async markAsRead(userId: number, notificationId?: number) {
    const updateData = { status: 'read' };

    if (notificationId) {
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });
      if (!notification || notification.userId !== userId) {
        return { updated: 0 };
      }
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: updateData,
      });
      return { updated: 1 };
    }

    const result = await this.prisma.notification.updateMany({
      where: { userId, status: 'unread' },
      data: updateData,
    });
    return { updated: result.count };
  }

  async createNotification(params: CreateNotificationParams) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        actorId: params.actorId,
        actorName: params.actorName,
        actorAvatar: params.actorAvatar,
        title: params.title,
        content: params.content,
        metadata: params.metadata,
      },
    });

    const mappedNotification = this.mapNotification(notification);
    this.sseGateway.sendNotification(params.userId, mappedNotification);

    return notification;
  }

  async deleteNotification(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.userId !== userId) {
      return { deleted: 0 };
    }
    await this.prisma.notification.delete({ where: { id: notificationId } });
    return { deleted: 1 };
  }

  private mapNotification(notification: Notification) {
    return {
      id: notification.id,
      type: notification.type,
      sourceType: notification.sourceType,
      sourceId: notification.sourceId,
      actor: {
        id: notification.actorId,
        name: notification.actorName,
        avatar: notification.actorAvatar,
      },
      title: notification.title,
      content: notification.content,
      status: notification.status,
      metadata: notification.metadata,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
