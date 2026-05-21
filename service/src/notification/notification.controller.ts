import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard, type AuthRequest } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { SseGateway } from './sse.gateway';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly sseGateway: SseGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getNotifications(@Req() request: AuthRequest, @Query() query: QueryNotificationsDto) {
    return this.notificationService.getNotifications(request.user!.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  getUnreadCount(@Req() request: AuthRequest) {
    return this.notificationService.getUnreadCount(request.user!.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read')
  markAsRead(@Req() request: AuthRequest, @Body() body: { notificationId?: number }) {
    return this.notificationService.markAsRead(request.user!.id, body.notificationId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteNotification(@Req() request: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.notificationService.deleteNotification(request.user!.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stream')
  async stream(@Req() request: AuthRequest, @Res() res: Response) {
    this.sseGateway.subscribe(request.user!.id, res);
  }
}