import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get hello message',
    description: 'Returns a simple hello world message from the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Hello message returned successfully',
    type: String,
    example: 'Hello World!',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
