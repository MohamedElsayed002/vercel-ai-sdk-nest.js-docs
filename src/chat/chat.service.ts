import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { GeminiService } from 'src/gemini/gemini.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';
import { GeminiConfig } from 'src/config/gemini.config';


@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name)

    constructor(private readonly geminiService: GeminiService) {}

    async chat(request: ChatRequestDto): Promise<ChatResponseDto> {
        this.logger.log(`Processing chat request: ${request.message.substring(0,50)}`)
        
        try {
            const response = await this.geminiService.generateContent(
                request.message,
                {
                    model: request.model || GeminiConfig.models.chat,
                    useWebSearch: request.enableWebSearch ?? true,
                    thinkingBudget: this.getThinkingBudget(request.complexity),
                    includeThoughts: true,
                    temperature: request.temperature ?? 0.7,
                    maxTokens: request.maxTokens ?? 8192
                }
            )
    
            // Calculate cache savings if applicable 
            const cacheSavings = response.usage.cachedTokens > 0
            ? {
                cached: response.usage.cachedTokens,
                total: response.usage.totalTokens,
                savingsPercentage: ((response.usage.cachedTokens / response.usage.totalTokens) * 75).toFixed(1),
              }
            : null;
    
                return {
                    response: response.text,
                    sources: response.sources,
                    usage: response.usage,
                    cacheSavings: cacheSavings ?? undefined,
                    cost: this.geminiService.calculateCost(response.usage, request.model),
                    toolCalls: response.toolCalls,
                    toolResults: response.toolResults,
                    timestamp: new Date()
                }
        }catch(error) {
            return error
        }
    }


    // Better Choice. for user experience
    async streamChat(request: ChatRequestDto): Promise<Observable<MessageEvent>> {
        this.logger.log(`Streaming chat request ${request.message.substring(0,50)}`)

        return new Observable((subscriber) => {
            (async () => {
                try {
                    const stream = await this.geminiService.streamContent(
                        request.message,
                        {
                            model: request.model || GeminiConfig.models.chat,
                            useWebSearch: request.enableWebSearch ?? true,
                            temperature: request.temperature ?? 0.7,
                            maxTokens: request.maxTokens ?? 8192
                        }
                    )

                    for await (const chunk of stream) {
                        subscriber.next({
                            data: {text: chunk},
                        } as MessageEvent)
                    }
                    subscriber.complete()
                } catch(error) {
                    subscriber.error(error)
                    return error
                }
            })()
        })
    }

    private getThinkingBudget(complexity?: 'simple' | 'medium' | 'complex' | 'advanced') : number {
        return GeminiConfig.thinkingBudgets[complexity || 'medium']
    }
}
