import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsObject, IsPositive, IsString } from 'class-validator';
import { ORDER_STATUS } from '../../constants';

export class OrderDto {
    @ApiProperty({
        description: 'Order ID',
        example: 1,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    orderId: number;

    @ApiProperty({
        description: 'client_id',
        example: 1,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    clientId: number;

    @ApiProperty({
        description: 'deliverer_id',
        example: 2,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    delivererId: number;

    @ApiProperty({
        description: 'Order price',
        example: 10000,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    price: number;

    @ApiProperty({
        description: 'Order status',
        example: ORDER_STATUS.ACCEPTED,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    status: number;
}