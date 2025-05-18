import { Injectable } from '@nestjs/common';
import { Order } from '../../../v1/entities/order-v1.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class OrderRepository {
    constructor(
        @InjectRepository(Order, 'connection1')
        private readonly orderRepository: Repository<Order>,
    ) {}
    
    async findOne(orderId: number, entityManager?: EntityManager) {
        if (entityManager) {
            return entityManager.findOne(Order, {
                where: {
                    order_id: orderId,
                },
            });
        }
        return this.orderRepository.findOne({
            where: {
                order_id: orderId,
            },
        });
    }

    async updateOne(orderId: number, order: Order, entityManager?: EntityManager) {
        if (entityManager) {
            return entityManager.update(Order, orderId, order);
        }
        return this.orderRepository.update(orderId, order);
    }
}
