import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Header,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { BotService } from './bot.service';
import { Bot as BotInterface } from './interfaces/bot.interface';
import { BotDocument } from './schemas/bot.schema';
// const { LazyModule } = await import("./")

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'none')
  @Header('Name', 'Mohamed Elsayed')
  findAll(): string {
    return this.botService.hello();
  }
  // @HttpCode(HttpStatus.OK)
  // @Get("/test/*")
  // test(): string {
  //     return this.botService.test()
  // }

  // @Get("/:id")
  // findOne(@Param("id",new ParseIntPipe({errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE})) id: number): string {
  //     return this.botService.findOne(id)
  // }

  @Post('create')
  async createBot(@Body() bot: { role: 'user' | 'system'; content: string }) {
    return this.botService.createBot(bot);
  }

  @Get('chats')
  async getAllChats(): Promise<BotDocument[]> {
    return this.botService.getAllChats();
  }

  @Get('test-my-app')
  testApp() {
    return `${process.env.SECRET_KEY}`;
  }
}
