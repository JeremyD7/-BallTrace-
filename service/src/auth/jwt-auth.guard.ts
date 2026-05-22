import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type AuthRequest = Request & {
  user?: {
    id: number;
    account: string;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = this.getToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        account: string;
      }>(token);

      request.user = {
        id: payload.sub,
        account: payload.account,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private getToken(request: Request) {
    const authorization = request.headers.authorization;

    if (authorization) {
      const [type, token] = authorization.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    const queryToken = (request.query as Record<string, string>)?.token;
    if (queryToken) {
      return queryToken;
    }

    return null;
  }
}
