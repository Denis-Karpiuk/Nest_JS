import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../core/exceptions/domain-exceptions';
import { ObjectIdValidationTransformationPipe } from '../core/pipes/object-id-validation-transformation-pipe.service';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-codes';

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  app.useGlobalPipes(
    new ObjectIdValidationTransformationPipe(),
    new ValidationPipe({
      transform: true,
      // Отбрасывает все значения которые не валидируются
      whitelist: false,

      stopAtFirstError: true,
      //Для преобразования ошибок класс валидатора в необходимый вид
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          extensions: formattedErrors,
        });
      },
    }),
  );
}

export function errorFormatter(
  errors: ValidationError[],
  errorMessage?: any,
): Extension[] {
  const errorsForResponse = errorMessage || [];

  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      for (const key of constrainKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}`
            : '',
          field: error.property,
        });
      }
    }
  }

  return errorsForResponse;
}
