import { 
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Sse,
    MessageEvent
} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { ThrottlerGuard } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(ThrottlerGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:'Send a chat message with web search grounding'})
    @ApiResponse({
        status: 200,
        description:'Chat response with sources and usage metrics',
        type: ChatResponseDto
    })
    async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
        return this.chatService.chat(chatRequest)
    }

    @Sse('stream')
    @ApiOperation({summary: 'Summary chat response'})
    async streamChat(@Body() chatRequest: ChatRequestDto): Promise<Observable<MessageEvent>> {
        return this.chatService.streamChat(chatRequest)
    }
}
