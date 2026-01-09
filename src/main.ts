import { LazyModuleLoader, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, HttpException, ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: new ConsoleLogger({
      colors: true,
      prefix: 'chat',
      json: true,
      timestamp: true,
    })
  });
  const config = new DocumentBuilder()
    .setTitle("Chatsbot")
    .setDescription("Bot Docs")
    .setVersion("1.0")
    .addTag('Bot')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app,config)
  SwaggerModule.setup("api",app,documentFactory)
  app.useGlobalPipes(new ValidationPipe());
  app.use(compression())
  app.use(helmet());
  app.enableCors()
  const lazyModuleLoader = app.get(LazyModuleLoader);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
