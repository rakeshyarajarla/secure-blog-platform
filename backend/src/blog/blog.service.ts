import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { Prisma } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('blog-summary') private summaryQueue: Queue,
  ) {}

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 8)
    );
  }

  async create(userId: string, createBlogDto: CreateBlogDto) {
    const slug = this.generateSlug(createBlogDto.title);

    try {
      const blog = await this.prisma.blog.create({
        data: {
          title: createBlogDto.title,
          content: createBlogDto.content,
          isPublished: createBlogDto.isPublished ?? false,
          slug,
          userId,
        },
      });

      if (blog.isPublished) {
        await this.summaryQueue.add('generate-summary', {
          blogId: blog.id,
          content: blog.content,
        });
      }

      return blog;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A blog with this slug already exists.');
        }
      }
      throw error;
    }
  }

  async findAllForUser(userId: string) {
    return this.prisma.blog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: string, id: string, updateBlogDto: UpdateBlogDto) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException('You can only edit your own blogs');
    }

    const updatedBlog = await this.prisma.blog.update({
      where: { id },
      data: updateBlogDto,
    });

    if (updateBlogDto.isPublished === true && !blog.isPublished) {
      await this.summaryQueue.add('generate-summary', {
        blogId: updatedBlog.id,
        content: updatedBlog.content,
      });
    }

    return updatedBlog;
  }

  async remove(userId: string, id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.userId !== userId) {
      throw new ForbiddenException('You can only delete your own blogs');
    }

    return this.prisma.blog.delete({
      where: { id },
    });
  }

  async getPublicBySlug(slug: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { slug, isPublished: true },
      include: {
        user: { select: { id: true, email: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }

  async getPublicFeed(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where: { isPublished: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.blog.count({ where: { isPublished: true } }),
    ]);

    return {
      data: blogs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
