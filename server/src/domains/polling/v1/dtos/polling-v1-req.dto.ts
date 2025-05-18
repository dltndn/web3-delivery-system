import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsEthereumAddress, IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ContractEventsReqParamsDto {
    @ApiProperty({
        description: 'Contract Address',
        example: '0x1234567890123456789012345678901234567890',
    })
    @IsString()
    @IsEthereumAddress()
    contractAddress: string;
}