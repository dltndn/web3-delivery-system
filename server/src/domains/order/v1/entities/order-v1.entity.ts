import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUS } from '../../constants';

 @Entity('order')
 export class Order {
    @ApiProperty({
        description: 'Order의 고유 ID',
        example: 1,
      })
    @PrimaryGeneratedColumn()
    order_id: number;

    @ApiProperty({
        description: 'client_id',
        example: 1,
    })
    @Column({
        nullable: false,
    })
    client_id: string;

    @ApiProperty({
        description: 'deliverer_id',
        example: 2,
    })
    @Column({
        nullable: true,
    })
    deliverer_id: string;

    @ApiProperty({
        description: 'Order price',
        example: 10000,
    })
    @Column({
        nullable: false,
    })
    price: number;

    @ApiProperty({
        description: 'Order status',
        example: ORDER_STATUS.ACCEPTED,
    })
    @Column({
        nullable: false,
    })
    status: number;

    @ApiProperty({
        description: '생성된 날짜',
        example: '2023-05-24T13:31:22.000Z',
    })
    @CreateDateColumn({
        nullable: false,
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
    })
    created_at: Date;

    @ApiProperty({
        description: '마지막으로 업데이트된 날짜',
        example: '2023-05-24T13:31:22.000Z',
    })
    @UpdateDateColumn({
        nullable: true,
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
        onUpdate: 'CURRENT_TIMESTAMP(0)',
    })
    updated_at: Date;

    @ApiProperty({
        description: '삭제된 날짜 (null일 수 있음)',
        example: null,
    })
    @DeleteDateColumn({ 
        nullable: true,
        type: 'datetime',
        precision: 0
    })
    deleted_at: Date | null;
  }
