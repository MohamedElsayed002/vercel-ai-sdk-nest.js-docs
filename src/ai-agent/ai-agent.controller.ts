import { Body, Controller, Post } from '@nestjs/common';
import { AiAgentService } from './ai-agent.service';

@Controller('ai-agent')
export class AiAgentController {

    constructor(
        private readonly AIAgentService: AiAgentService
    ) {}

    @Post()
    async Agent(@Body() request: { prompt: string}) {
        return this.AIAgentService.runAgent(request.prompt)
    }
}
