import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(payload: RegisterDto) {
    const normalizedAccount = payload.account.trim();
    const normalizedNickname = payload.nickname?.trim() || normalizedAccount;
    const normalizedAvatarUrl = payload.avatarUrl?.trim() || null;
    const normalizedBio = payload.bio?.trim() || null;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        account: normalizedAccount,
      },
    });

    if (existingUser) {
      throw new ConflictException('Account already exists');
    }

    const passwordHash = await hash(payload.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          account: normalizedAccount,
          nickname: normalizedNickname,
          passwordHash,
          avatarUrl: normalizedAvatarUrl,
          bio: normalizedBio,
        },
      });

      return this.buildAuthResult(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Account already exists');
      }

      throw error;
    }
  }

  async login(payload: LoginDto) {
    const normalizedAccount = payload.account.trim();
    const user = await this.prisma.user.findUnique({
      where: {
        account: normalizedAccount,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid account or password');
    }

    const isPasswordValid = await compare(payload.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid account or password');
    }

    return this.buildAuthResult(user);
  }

  private async buildAuthResult(user: User) {
    const expiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') ?? '7d';
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      account: user.account,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: this.toSafeUser(user),
    };
  }

  private toSafeUser(user: User) {
    return {
      id: user.id,
      account: user.account,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
