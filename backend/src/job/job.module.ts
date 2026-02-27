import { Module } from '@nestjs/common';
import { SummaryProcessor } from './summary.processor';

@Module({
  providers: [SummaryProcessor],
})
export class JobModule {}
