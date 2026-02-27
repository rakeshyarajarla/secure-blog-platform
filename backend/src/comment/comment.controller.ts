import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('blogs/:blogId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req: any,
    @Param('blogId') blogId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(req.user.id, blogId, createCommentDto);
  }

  @Get()
  findAllForBlog(@Param('blogId') blogId: string) {
    return this.commentService.findAllForBlog(blogId);
  }
}
