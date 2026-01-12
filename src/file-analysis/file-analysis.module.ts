import { Module } from '@nestjs/common';
import { FileAnalysisController } from './file-analysis.controller';
import { GeminiModule } from 'src/gemini/gemini.module';
import { FileAnalysisService } from './file-analysis.service';

@Module({
  imports: [GeminiModule],
  controllers: [FileAnalysisController],
  providers: [FileAnalysisService]
})
export class FileAnalysisModule {}
