import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable, of } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  @Injectable()
  export class RabbitMQInterceptor implements NestInterceptor {
    private logger = new Logger();
    constructor(private readonly routingKey: string) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const message = context.switchToRpc().getContext();
      const originalMessage = context.switchToRpc().getContext().getMessage();
  
      const subRoutingKey = message.args[0].fields.routingKey;
      const channel = context.switchToRpc().getContext().getChannelRef();
  
      if (this.routingKey !== subRoutingKey) {
        return of(null);
      }
      this.logger.log(`RabbitMQInterceptor :: ${originalMessage}`);
      return next.handle().pipe(
        tap({
          next: () => {
            channel.ack(originalMessage);
          },
          error: (error) => {
            this.logger.error(`MQ Channal ack error :: ${error}`);
          },
        }),
      );
    }
  }
  