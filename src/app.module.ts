import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { LoggerMiddleware } from './logger.middleware';
import { BotController } from './bot/bot.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GeminiModule } from './gemini/gemini.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ChatModule } from './chat/chat.module';
import { FileAnalysisService } from './file-analysis/file-analysis.service';
import { FileAnalysisModule } from './file-analysis/file-analysis.module';
import { CodeExecutionModule } from './code-execution/code-execution.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    BotModule,
    GeminiModule,
    ChatModule,
    FileAnalysisModule,
    CodeExecutionModule,
  ],
  providers: [FileAnalysisService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(BotController);
    // consumer.apply(LoggerMiddleware).exclude(
    //   {path: '/',method: RequestMethod.GET}
    // )
  }
}
