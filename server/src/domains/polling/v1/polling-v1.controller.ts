import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    Query,
  } from '@nestjs/common';
import { PollingV1Service } from './polling-v1.service';
import { CatchErrors } from '../../../core/decorator/catch-errors.decorator';
import { ContractEventsReqParamsDto } from './dtos/polling-v1-req.dto';

@Controller('v1/polling')
export class PollingV1Controller {
    constructor(private readonly pollingV1Service: PollingV1Service) {}

    @Post('contracts/:contractAddress/events')
    @CatchErrors()
    async pollContractEvents(
        @Param() params: ContractEventsReqParamsDto,
        @Body() body: any
    ) {
        return this.pollingV1Service.pollContractEvents(params.contractAddress, body);
    }
}
