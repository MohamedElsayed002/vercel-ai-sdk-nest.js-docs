import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { GeminiModule } from 'src/gemini/gemini.module';

@Module({
  imports: [GeminiModule],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule { }
