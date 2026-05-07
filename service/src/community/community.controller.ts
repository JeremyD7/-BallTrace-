import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, type AuthRequest } from '../auth/jwt-auth.guard';
import { CommunityService } from './community.service';
import { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { QueryCommunityPostsDto } from './dto/query-community-posts.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  getPosts(@Query() query: QueryCommunityPostsDto) {
    return this.communityService.getPosts(query);
  }

  @Get('posts/search')
  searchPosts(@Query('keyword') keyword = '') {
    return this.communityService.searchPosts(keyword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts/my')
  getMyPosts(@Req() request: AuthRequest) {
    return this.communityService.getPostsByUserId(request.user!.id);
  }

  @Get('posts/:id')
  getPostDetail(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.getPostDetail(id);
  }

  @Get('posts/:postId/comments')
  getComments(@Param('postId', ParseIntPipe) postId: number) {
    return this.communityService.getComments(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  createPost(@Req() request: AuthRequest, @Body() body: CreateCommunityPostDto) {
    return this.communityService.createPost(request.user!.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/like')
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthRequest,
  ) {
    return this.communityService.toggleLike(id, request.user!.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:postId/comments')
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() request: AuthRequest,
    @Body() body: CreateCommunityCommentDto,
  ) {
    return this.communityService.createComment(postId, request.user!.id, body);
  }
}
