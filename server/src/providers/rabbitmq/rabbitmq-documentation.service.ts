import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from 'src/config/environment/config';
import 'reflect-metadata';
import { getProperties } from '../../core/decorator/rabbitmq-property.decorator';
import { QUEUE } from './constants/queue.constants';
import { CONSUME_BIND } from './constants/consume-bind.constants';
import { ROUTING_KEY } from './constants/routing-key.constants';
import { PRODUCE_BIND } from './constants/produce-bind.constants';

@Injectable()
export class RabbitMQDocumentationService {
  constructor() {}

  generateDocumentation() {
    const result = {
      type: 'RabbitMQ',
      producer: {
        exchanges: [],
        routingKeys: [],
        publishes: [],
      },
      consumer: {
        routingKeys: [],
        queues: [],
      },
    };
    // producer 생성
    Object.values(PRODUCE_BIND).forEach((bind) => {
      const routingKeyDetails = Object.values(ROUTING_KEY).find(
        (rk) => rk.name === bind.routingKey,
      );
      if (routingKeyDetails) {
        const properties = getProperties(routingKeyDetails.type);
        const message = {
          type: 'object',
          properties: {},
          required: [],
        };
        properties.forEach((property) => {
          const propertyName = property.name;
          message['properties'][propertyName] = {
            type: property.type,
            description: property.description,
          };
          if (property.required) {
            message['required'].push(propertyName);
          }
        });
        result.producer.routingKeys.push({
          name: routingKeyDetails.name,
          message,
          version: routingKeyDetails.version,
        });
        result.producer.publishes.push({
          exchange: bind.exchange,
          routingKey: {
            name: routingKeyDetails.name,
            version: routingKeyDetails.version,
          },
          service: Config.getEnvironment().SERVICE_NAME,
        });
      }
      result.producer.exchanges.push(bind.exchange);
    });

    // consumer 생성
    Object.values(QUEUE).forEach((queue) => {
      const relatedBindings = CONSUME_BIND.filter(
        (bind) => bind.queue === queue,
      );
      relatedBindings.forEach((bind) => {
        const routingKeyDetails = Object.values(ROUTING_KEY).find(
          (rk) => rk.name === bind.routingKey.name,
        );
        if (routingKeyDetails) {
          const properties = getProperties(routingKeyDetails.type);
          const message = {
            type: 'object',
            properties: {},
            required: [],
          };
          properties.forEach((property) => {
            const propertyName = property.name;
            message['properties'][propertyName] = {
              type: property.type,
              description: property.description,
            };
            if (property.required) {
              message['required'].push(propertyName);
            }
          });
          result.consumer.routingKeys.push({
            name: routingKeyDetails.name,
            message,
            version: routingKeyDetails.version,
          });
        }
        result.consumer.queues.push({
          name: queue,
          exchange: bind.exchange,
          routingKey: {
            name: routingKeyDetails.name,
            version: routingKeyDetails.version,
          },
          service: Config.getEnvironment().SERVICE_NAME,
        });
      });
    });
    const docsDir = path.join(process.cwd(), 'mq-doc');
    const filePath = path.join(docsDir, 'mq.docs.json');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir);
    }
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
  }
}
