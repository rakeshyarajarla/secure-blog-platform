import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('blogs/:blogId/like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  like(@Request() req: any, @Param('blogId') blogId: string) {
    return this.likeService.likeBlog(req.user.id, blogId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  unlike(@Request() req: any, @Param('blogId') blogId: string) {
    return this.likeService.unlikeBlog(req.user.id, blogId);
  }
}
