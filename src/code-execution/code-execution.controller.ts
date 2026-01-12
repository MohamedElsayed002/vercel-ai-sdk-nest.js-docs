import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CodeExecutionService } from './code-execution.service';
import { CodeExecutionRequestDto, CodeExecutionResponseDto } from './dto/code-execution.dto';

@ApiTags('Code Execution')
@Controller('code-execution')
export class CodeExecutionController {

    constructor(
        private readonly codeExecutionSerivce: CodeExecutionService
    ) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Execute code for a given problem',
        description: 'Uses AI to generate and execute code to solve a given problem. Supports code execution tools for running Python and other languages.'
    })
    @ApiBody({ type: CodeExecutionRequestDto })
    @ApiResponse({
        status: 200,
        description: 'Code execution completed successfully',
        type: CodeExecutionResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid input',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error',
    })
    async codeExecution(@Body() body: CodeExecutionRequestDto): Promise<CodeExecutionResponseDto> {
        return this.codeExecutionSerivce.codeExecution(body.problem);
    }
}
