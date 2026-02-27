import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    blogId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        userId,
        blogId,
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    });
  }

  async findAllForBlog(blogId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.prisma.comment.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true } },
      },
    });
  }
}
