import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GeminiResponse,
  GeminiOptions,
  UsageMetadata,
} from './interfaces/gemini-response.interface';
import { GeminiConfig } from 'src/config/gemini.config';
import { google } from '@ai-sdk/google';
import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      throw new Error('API Key is required');
    }
  }

  async generateContent(
    prompt: string,
    options: GeminiOptions = {},
  ): Promise<GeminiResponse> {
    const {
      model = GeminiConfig.models.chat,
      useWebSearch = false,
      useCodeExecution = false,
      // fileData = null,
      thinkingBudget = null,
      includeThoughts = false,
      temperature = 0.7,
      maxTokens = 8192,
    } = options;

    try {
      this.logger.log(`Generating content with model ${model}`);
      const tools: any = {};

      if (useWebSearch) {
        tools.google_search = google.tools.googleSearch({});
      }

      if (useCodeExecution) {
        tools.code_execution = google.tools.codeExecution({});
      }

      const messages: any[] = [];

      messages.push({
        role: 'user',
        content: prompt,
      });

      // Build Provider options
      const providerOptions: any = {
        google: {},
      };

      if (thinkingBudget !== null || includeThoughts) {
        providerOptions.google.thinkingConfig = {};

        if (thinkingBudget !== null) {
          providerOptions.google.thinkingConfig.thinkingBudget = thinkingBudget;
        }

        if (includeThoughts) {
          providerOptions.google.thinkingConfig.includeThoughts = true;
        }
      }

      const result = await generateText({
        model: google(model),
        messages,
        tools: Object.keys(tools).length > 0 ? tools : undefined,
        providerOptions,
        temperature,
        maxOutputTokens: maxTokens,
      });

      const googleMetadata = result.providerMetadata?.google as any;

      const usage: UsageMetadata = {
        // @ts-expect-error
        promptTokens: result.usage?.promptTokens || 0,
        // @ts-expect-error
        completionTokens: result.usage?.completionTokens || 0,
        totalTokens: result.usage?.totalTokens || 0,
        cachedTokens: 0,
      };

      if (googleMetadata?.usageMetadata?.cachedContentTokenCount) {
        usage.cachedTokens =
          googleMetadata.usageMetadata.cachedContentTokenCount;
      }

      const sources = googleMetadata?.groundingMetadata?.groundingChunks || [];
      const codeExecution = googleMetadata?.codeExecutionResults || [];

      return {
        text: result.text,
        sources,
        codeExecution,
        usage,
        reasoning: result.reasoning || null,
        toolCalls: result.toolCalls || [],
        toolResults: result.toolResults || [],
        rawResponse: result,
      };
    } catch (error) {
      this.logger.error(`Gemini API Error ${error.message}`);
      throw error;
    }
  }

  async streamContent(prompt: string, options: GeminiOptions = {}) {
    const {
      model = GeminiConfig.models.chat,
      useWebSearch = false,
      useCodeExecution = false,
      temperature = 0.7,
      maxTokens = 8192,
    } = options;

    try {
      this.logger.log(`Streaming content with model: ${model}`);

      // Build tools
      const tools: any = {};

      if (useWebSearch) {
        tools.google_search = google.tools.googleSearch({});
      }

      if (useCodeExecution) {
        tools.code_execution = google.tools.codeExecution({});
      }

      // Stream text
      const result = await streamText({
        model: google(model),
        prompt,
        tools: Object.keys(tools).length > 0 ? tools : undefined,
        temperature,
        maxOutputTokens: maxTokens,
      });

      return result.textStream;
    } catch (error) {
      this.logger.error(`Streaming Error: ${error.message}`);
      throw error;
    }
  }

  async generateStructuredObject(prompt: string, options: GeminiOptions = {}) {
    const {
      model = GeminiConfig.models.chat,
      temperature = 0.7,
      maxTokens = 8192,
    } = options;

    const schema = z.object({
      title: z
        .string()
        .describe('I want to generate a good title for the movie'),
      summary: z
        .string()
        .describe('I want to generate a good summary for this movie'),
    });

    try {
      const result = await generateObject({
        model: google(model),
        prompt,
        schema,
        temperature,
        maxOutputTokens: maxTokens,
      });

      return {
        title: result.object.title,
        summary: result.object.summary,
        result: result.object,
      };
    } catch (error) {
      this.logger.error(`Error ${error.message}`);
      return error;
    }
  }

  calculateCost(usage: UsageMetadata, model: string = 'gemini-2.5-flash'): number {
    const pricing = GeminiConfig.pricing[model];
    if (!pricing) return 0;

    const inputCost = (usage.promptTokens / 1000000) * pricing.inputPer1M;
    const outputCost = (usage.completionTokens / 1000000) * pricing.outputPer1M;
    const cachedSavings = (usage.cachedTokens / 1000000) * pricing.inputPer1M * pricing.cachedDiscount;

    return inputCost + outputCost - cachedSavings;
  }
}
