import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Header,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BotService } from './bot.service';
import { BotDocument } from './schemas/bot.schema';
import {
  CreateBotRequestDto,
  CreateBotResponseDto,
  BotDocumentDto,
  GenerateFoodResponseDto,
  CodeExecResponseDto,
  GoogleSearchResponseDto,
} from './dto/bot.dto';
// const { LazyModule } = await import("./")

@ApiTags('Bot')
@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'none')
  @Header('Name', 'Mohamed Elsayed')
  @ApiOperation({
    summary: 'Get hello message',
    description: 'Returns a simple hello world message',
  })
  @ApiResponse({
    status: 200,
    description: 'Hello message returned successfully',
    type: String,
    example: 'Hello World',
  })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create a new bot conversation',
    description: 'Creates a new bot conversation entry and generates an AI response using Gemini with thinking capabilities',
  })
  @ApiBody({ type: CreateBotRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Bot conversation created successfully',
    type: CreateBotResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async createBot(@Body() bot: CreateBotRequestDto): Promise<CreateBotResponseDto> {
    return this.botService.createBot(bot);
  }

  @Get('chats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all chat conversations',
    description: 'Retrieves all stored chat conversations. Results are cached for 60 seconds.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all chat conversations',
    type: [BotDocumentDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAllChats(): Promise<BotDocument[]> {
    return this.botService.getAllChats();
  }

  @Get('caching-food')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate food recipes with caching',
    description: 'Demonstrates caching functionality by generating vegetarian and meat lasagna recipes using cached food knowledge base',
  })
  @ApiResponse({
    status: 200,
    description: 'Food recipes generated successfully',
    type: GenerateFoodResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async CachedFoot(): Promise<GenerateFoodResponseDto> {
    return this.botService.generateFood();
  }

  @Get('code-execution')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute code using AI',
    description: 'Demonstrates code execution capabilities by calculating the 20th Fibonacci number using Python',
  })
  @ApiResponse({
    status: 200,
    description: 'Code executed successfully',
    type: CodeExecResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async CodeExec(): Promise<CodeExecResponseDto> {
    return this.botService.codeExec();
  }

  @Get('google-search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Perform Google search using AI',
    description: 'Uses Google Search tool to find latest news from Egypt and USA with article dates',
  })
  @ApiResponse({
    status: 200,
    description: 'Google search completed successfully',
    type: GoogleSearchResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async GoogleSearch(): Promise<GoogleSearchResponseDto> {
    return this.botService.googleSearch();
  }

  @Get('test-my-app')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test application configuration',
    description: 'Returns the secret key from environment variables (for testing purposes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Secret key returned',
    type: String,
  })
  testApp(): string {
    return `${process.env.SECRET_KEY}`;
  }
}
