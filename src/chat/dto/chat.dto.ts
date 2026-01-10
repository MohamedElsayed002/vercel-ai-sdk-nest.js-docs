import { ApiProperty } from "@nestjs/swagger"
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsNumber,
    Min,
    Max
} from "class-validator"

export class ChatRequestDto {
    @ApiProperty({
        description: 'The message to send to the AI',
        example: "What are the latest developments in AI?"
    })
    @IsString()
    @IsNotEmpty()
    message: string

    @ApiProperty({
        description: 'Model to use',
        example: 'gemini-2.5-flash',
        required: false
    })
    @IsOptional()
    @IsString()
    model?: string

    @ApiProperty({
        description: 'Enable web search grounding',
        example: true,
        required: false,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    enableWebSearch?: boolean

    @ApiProperty({
        description: 'Complexity level for thinking budget',
        enum: ['simple', 'medium', 'complex', 'advacned'],
        required: false,
        default: 'medium'
    })
    @IsOptional()
    @IsEnum(['simple', 'medium', 'complex', 'advanced'])
    complexity?: 'simple' | 'medium' | 'complex' | 'advanced'

    @ApiProperty({
        description: 'Temperature for response randomness (0-1)',
        example: 0.7,
        required: false,
        default: 0.7,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    temperature?: number;

    @ApiProperty({
        description: 'Maximum tokens to generate',
        example: 8192,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    maxTokens?: number;
}

export class ChatResponseDto {
    @ApiProperty({ description: 'AI generated response' })
    response: string;
  
    @ApiProperty({ description: 'Sources from web search', type: [Object] })
    sources: Array<{ text: string; url?: string }>;
  
    @ApiProperty({ description: 'Token usage metrics' })
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      cachedTokens: number;
    };
  
    @ApiProperty({ description: 'Cache savings information', required: false })
    cacheSavings?: {
      cached: number;
      total: number;
      savingsPercentage: string;
    };
  
    @ApiProperty({ description: 'Estimated cost in USD' })
    cost: number;
  
    @ApiProperty({ description: 'Tool calls made', required: false })
    toolCalls?: any[];
  
    @ApiProperty({ description: 'Tool results', required: false })
    toolResults?: any[];
  
    @ApiProperty({ description: 'Response timestamp' })
    timestamp: Date;
  }