import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Processor('blog-summary')
export class SummaryProcessor extends WorkerHost {
  private readonly logger = new Logger(SummaryProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { blogId, content } = job.data;

    this.logger.log(`Processing summary generation for blog ${blogId}...`);

    try {
      // Simulate an AI call or text processing taking some time
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const generatedSummary =
        content.substring(0, 150) + '... (Auto-Generated Summary)';

      await this.prisma.blog.update({
        where: { id: blogId },
        data: { summary: generatedSummary },
      });

      this.logger.log(
        `Summary generated and saved successfully for blog ${blogId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate summary for blog ${blogId}`,
        error.stack,
      );
      throw error;
    }
  }
}
