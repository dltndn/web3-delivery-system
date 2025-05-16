import { Config } from '../../../config/environment/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../../domains/account/v1/entities/account.entity';
import { ChainAccount } from '../../../domains/account/v1/entities/chain-account.entity';
import { EoaAuthenticationMethod } from '../../../domains/account/v1/entities/eoa-authentication-method.entity';
import { EoaAuthenticator } from '../../../domains/account/v1/entities/eoa-authenticator.entity';
import { EmailAuthentication } from '../../../domains/authentication/v1/entities/email-authentication.entity';
import { EmailVerificationCode } from '../../../domains/authentication/v1/entities/email-verification-code.entity';
import { Otp } from '../../../domains/authentication/v1/entities/otp.entity';
import { SecondaryPassword } from '../../../domains/authentication/v1/entities/secondary-password.entity';
import { ProjectAuthMethod } from '../../../domains/authentication/v1/entities/project-auth-method.entity';
import { GuardianAccount } from '../../../domains/guardian/v1/entities/guardian-account.entity';
import { GuardianAuthenticationSignature } from '../../../domains/guardian/v1/entities/guardian-authentication-signature.entity';
import { GuardianContract } from '../../../domains/guardian/v1/entities/guardian-contract.entity';
import { GuardianRecoveryRequest } from '../../../domains/guardian/v1/entities/guardian-recovery-request.entity';
import { GuardianTransaction } from '../../../domains/guardian/v1/entities/guardian-transaction.entity';
import { GuardianTransactionSignature } from '../../../domains/guardian/v1/entities/guardian-transaction-signature.entity';
import { Guardian } from '../../../domains/guardian/v1/entities/guardian.entity';
import { ContractEvm } from '../../../domains/network/v1/entities/contract-evm.entity';
import { ContractTvm } from '../../../domains/network/v1/entities/contract-tvm.entity';
import { Contract } from '../../../domains/network/v1/entities/contract.entity';
import { Network } from '../../../domains/network/v1/entities/network.entity';
import { PaymasterBlacklist } from '../../../domains/network/v1/entities/paymaster-blacklist.entity';
import { Paymaster } from '../../../domains/network/v1/entities/paymaster.entity';
import { ScwFactory } from '../../../domains/network/v1/entities/scw-factory.entity';
import { ScwImplementation } from '../../../domains/network/v1/entities/scw-implementation.entity';

export const MYSQL = {
  CONNECTION1: {
    ...Config.getEnvironment().DB_1,
    entities: [
      Account,
      ChainAccount,
      EoaAuthenticationMethod,
      EoaAuthenticator,
      EmailAuthentication,
      EmailVerificationCode,
      Otp,
      SecondaryPassword,
      ProjectAuthMethod,
      GuardianAccount,
      GuardianAuthenticationSignature,
      GuardianContract,
      GuardianRecoveryRequest,
      GuardianTransaction,
      GuardianTransactionSignature,
      Guardian,
      ContractEvm,
      ContractTvm,
      Contract,
      Network,
      PaymasterBlacklist,
      Paymaster,
      ScwFactory,
      ScwImplementation,
    ],
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
