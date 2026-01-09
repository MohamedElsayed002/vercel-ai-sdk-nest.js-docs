import { Injectable, Inject } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Bot, BotDocument } from './schemas/bot.schema';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { createGoogleGenerativeAI, GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import { generateText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!
})


@Injectable()
export class BotService {
  // private readonly bots: Bot[] = [];
  private readonly CACHE_KEY = 'all_chats';
  private readonly CACHE_TTL = 60000; // 60 seconds

  constructor(
    private lazyModuleLoader: LazyModuleLoader,
    @InjectModel(Bot.name) private botModel: Model<Bot>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  hello(): string {
    return 'Hello World';
  }

  test(): string {
    return 'Testing';
  }

  findOne(id: number): string {
    return `Bot ${id}`;
  }

  async createBot(bot: Bot): Promise<{text: string, reason: string}> {

    await this.botModel.create({ role: "user", content: bot.content })

    const { text, reasoning } = await generateText({
      model: google("gemini-3-flash-preview"),
      prompt: bot.content,
      temperature: 0.7,
      maxOutputTokens: 1000,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 200,
            thinkingLevel: 'high',
            includeThoughts: true
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_LOW_AND_ABOVE'
            }
          ]
        } as GoogleGenerativeAIProviderOptions
      },
    })


    await this.botModel.create({ role: 'system', content: text })

    // Invalidate cache when new chat is created
    await this.cacheManager.del(this.CACHE_KEY);
    return {
      text,
      reason: JSON.stringify(reasoning)
    }
  }

  async getAllChats(): Promise<BotDocument[]> {
    // Try to get from cache first
    const cachedChats = await this.cacheManager.get<BotDocument[]>(this.CACHE_KEY);

    if (cachedChats) {
      return cachedChats;
    }

    // If not in cache, fetch from database
    const chats = await this.botModel.find().exec();

    // Store in cache for future requests
    await this.cacheManager.set(this.CACHE_KEY, chats, this.CACHE_TTL);

    return chats;
  }
}
