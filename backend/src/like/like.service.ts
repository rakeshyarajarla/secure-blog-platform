import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async likeBlog(userId: string, blogId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    try {
      await this.prisma.like.create({
        data: {
          userId,
          blogId,
        },
      });
      return { message: 'Blog liked successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('You have already liked this blog.');
        }
      }
      throw error;
    }
  }

  async unlikeBlog(userId: string, blogId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.like.delete({
      where: {
        id: like.id,
      },
    });

    return { message: 'Blog unliked successfully' };
  }
}
