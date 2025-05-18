import { InternalServerErrorException } from '@nestjs/common';
import 'reflect-metadata';

export function CatchErrors() {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = new Proxy(originalMethod, {
      async apply(target, thisArg, args) {
        try {
          return await target.apply(thisArg, args);
        } catch (error) {
          if (error?.response?.errorCode) {
            // 예외처리한 에러일 경우 ExceptionFilter로 모두 전달되기 때문에 그대로 throw 합니다.
            throw error;
          } else {
            // 예외처리하지 못한 예상치 못한 에러일 경우 ExceptionFilter로 전달되지 않는 에러가 있을 수 있습니다. 그래서 InternalServerErrorException으로 throw하여 ExceptionFilter로 전달 합니다.
            throw new InternalServerErrorException(error);
          }
        }
      },
    });

    return descriptor;
  };
}
