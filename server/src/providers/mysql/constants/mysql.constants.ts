import { Config } from '../../../config/environment/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../../domains/order/v1/entities/order-v1.entity';

export const MYSQL = {
  CONNECTION1: {
    ...Config.getEnvironment().DB_1,
    entities: [Order],
    synchronize: Config.getEnvironment().NODE_ENV !== 'production',
    timezone: 'Z',
  },
};

export const MYSQL_CONNECTION = [
  {
    name: 'connection1',
    connection: MYSQL.CONNECTION1,
  },
];

export const TypeOrmModules = MYSQL_CONNECTION.map((mySqlConnection) =>
  TypeOrmModule.forRootAsync({
    name: mySqlConnection.name,
    useFactory: () => mySqlConnection.connection,
  }),
);
