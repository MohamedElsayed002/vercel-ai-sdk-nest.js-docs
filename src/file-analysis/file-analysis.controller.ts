import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileAnalysisService } from './file-analysis.service';

@Controller('file-analysis')
export class FileAnalysisController {

    constructor(
        private readonly FileAnalysisService: FileAnalysisService
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async FileAnalysis(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { prompt?: string }
    ) {
        return this.FileAnalysisService.analyzeFile(file, body)
    }
}
