import { Module } from '@nestjs/common';
import { ethers } from 'ethers';
import { EthersService } from './ethers.service';

@Module({
  providers: [
    EthersService,
    {
      provide: 'ETHERS',
      useFactory: () => {
        return {
          ethers,
        };
      },
    },
  ],
  exports: [EthersService],
})
export class EthersModule {}
