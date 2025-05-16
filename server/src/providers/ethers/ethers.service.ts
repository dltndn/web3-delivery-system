import { Inject, Injectable } from '@nestjs/common';
import { ethers, Wallet, Contract, Signer } from 'ethers';

@Injectable()
export class EthersService {
  constructor(@Inject('ETHERS') private readonly ethersProvider: { 
    ethers: typeof ethers; 
  }) {}

  getEthers() {
    return this.ethersProvider.ethers;
  }

  async signTypedData(
    privateKey: string,
    domain: ethers.TypedDataDomain,
    types: Record<string, Array<ethers.TypedDataField>>,
    value: Record<string, any>
  ): Promise<string> {
    const signer = new Wallet(privateKey)
    return signer.signTypedData(domain, types, value);
  }
}
