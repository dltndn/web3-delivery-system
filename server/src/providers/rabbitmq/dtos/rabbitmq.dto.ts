import { MqProperty } from 'src/core/decorator/rabbitmq-property.decorator';
import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderCompleteRmqDto {
  @MqProperty({
    type: 'number',
    description: 'Order id',
    required: true,
  })
  @IsInt()
  @Type(() => Number)
  orderId: number;
}
