import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
  imports: [PrismaModule, AuthModule, NotificationModule],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
