import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthRequest } from '../auth/jwt-auth.guard';
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { QueryMatchesDto } from './dto/query-matches.dto';

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  getMatches(@Query() query: QueryMatchesDto) {
    return this.matchService.getMatches(query);
  }

  @Get(':id')
  getMatchDetail(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.getMatchDetail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createMatch(@Req() request: AuthRequest, @Body() body: CreateMatchDto) {
    return this.matchService.createMatch(request.user!.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/apply')
  applyMatch(@Param('id', ParseIntPipe) id: number, @Req() request: AuthRequest) {
    return this.matchService.applyMatch(id, request.user!.id);
  }
}