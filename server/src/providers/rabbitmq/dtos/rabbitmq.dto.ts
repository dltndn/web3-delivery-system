import { MqProperty } from 'src/core/decorators/rabbitmq-property.decorator';
import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderCompleteRmqDto {
  @MqProperty({
    type: 'number',
    description: 'Webhook id',
    required: true,
  })
  webhookId: number;

  @MqProperty({
    type: 'number',
    description: 'project event group id',
    required: true,
  })
  @IsInt()
  @Type(() => Number)
  projectEventId: number;

  @MqProperty({
    type: 'object',
    description: 'Webhook data',
    required: true,
  })
  webhookData: object;

  @MqProperty({
    type: 'string',
    description: 'webhook Url',
    required: true,
  })
  @IsString()
  webhookUrl: string;
}
