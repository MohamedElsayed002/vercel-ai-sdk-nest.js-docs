import { Body, Controller, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post()
  async generateText(@Body() body: any) {
    const { prompt, options } = body;
    return this.geminiService.generateContent(prompt, options);
  }

  @Post('stream-text')
  async StreamText(@Body() body: any) {
    const { prompt, options } = body;
    return this.geminiService.streamContent(prompt, options);
  }

  @Post('generate-object')
  async generatingObject(@Body() body: any) {
    const { prompt, options } = body;
    return this.geminiService.generateStructuredObject(prompt, options);
  }
}
