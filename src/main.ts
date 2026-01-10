import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Logger
    logger: new ConsoleLogger({
      colors: true,
      prefix: 'chat',
      json: true,
      timestamp: true,
    }),
  });

  // Docs Swagger
  const config = new DocumentBuilder()
    .setTitle('Google Gemini AI API')
    .setDescription(
      'Advanced AI capabilities with Google Gemini using Vercel AI SDK',
    )
    .setVersion('1.0')
    // .addTag('')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Validaiton & Security
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      // forbidNonWhitelisted: true,
      // transform: true
    }),
  );
  app.use(compression());
  app.use(helmet());
  app.enableCors();

  // const lazyModuleLoader = app.get(LazyModuleLoader);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
