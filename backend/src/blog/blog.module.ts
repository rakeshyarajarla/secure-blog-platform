import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'blog-summary',
    }),
  ],
  providers: [BlogService],
  controllers: [BlogController],
})
export class BlogModule {}
