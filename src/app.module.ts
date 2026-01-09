import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { LoggerMiddleware } from './logger.middleware';
import { BotController } from './bot/bot.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    BotModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(BotController);
    // consumer.apply(LoggerMiddleware).exclude(
    //   {path: '/',method: RequestMethod.GET}
    // )
  }
}
