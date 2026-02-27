import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post('blogs')
  create(@Request() req: any, @Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(req.user.id, createBlogDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('blogs/me')
  findAllForUser(@Request() req: any) {
    return this.blogService.findAllForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('blogs/:id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(req.user.id, id, updateBlogDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('blogs/:id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.blogService.remove(req.user.id, id);
  }

  // Public Endpoints

  @Get('public/feed')
  getPublicFeed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.blogService.getPublicFeed(page, limit);
  }

  @Get('public/blogs/:slug')
  getPublicBySlug(@Param('slug') slug: string) {
    return this.blogService.getPublicBySlug(slug);
  }
}
