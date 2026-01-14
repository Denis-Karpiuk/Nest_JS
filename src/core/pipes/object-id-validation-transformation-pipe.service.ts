import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

export const ObjectIdType = Types.ObjectId;

// Custom pipe example
// https://docs.nestjs.com/pipes#custom-pipes
@Injectable()
export class ObjectIdValidationTransformationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — ObjectId
    if (metadata.metatype !== ObjectIdType) {
      return value;
    }

    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid ObjectId: ${value}`,
      });
    }
    return new ObjectIdType(value); // Преобразуем строку в ObjectId

    // Если тип не ObjectId, возвращаем значение без изменений
  }
}

/**
 * Not add it globally. Use only locally
 */
@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — ObjectId

    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid ObjectId: ${value}`,
      });
    }

    // Если тип не ObjectId, возвращаем значение без изменений
    return value;
  }
}
