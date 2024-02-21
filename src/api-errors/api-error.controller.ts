import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { QueryFailedError } from 'typeorm';
// import multer from 'multer';
import IApiErrors from './api-error.type';
import logger from '../config/logger';
import ApiError from './api-error.util';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export function customResponse(res: Response, code: number, data:unknown, error:unknown = null) {
  return res.status(code).json({ status: code, data: data, error: error });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function globalErrorHandling(err: unknown, req: Request, res: Response, next: NextFunction) {
  // Logging Error
  logger.error(err);

  // API Error
  if (err instanceof ApiError) {
    return customResponse(res, err.code, null, err.errorMessage);
  }

  // JWT Token Expired Error
  if (err instanceof TokenExpiredError) {
    return customResponse(res, 403, null, IApiErrors.FORBIDDEN);
  }

  // JWT Token Expired Error
  if (err instanceof JsonWebTokenError) {
    return customResponse(res, 401, null, IApiErrors.UNAUTHORIZED);
  }

  // JOI Error
  if (err instanceof Joi.ValidationError) {
    type Obj = {
      label:string | number,
      msg:string
    };
    const error:Array<Obj> = [];
    err.details.forEach((e) => {
      const data = {
        label: e.path[0],
        msg: e.message,
      };
      error.push(data);
    });
    return customResponse(res, 422, null, { message: 'Validation Error', errors: error });
  }

  // ORM errors
  if (err instanceof QueryFailedError) {
    // Check if duplicate error
    if (err.driverError.code === 'ER_DUP_ENTRY') {
      return customResponse(res, 400, null, 'Duplicate Entry');
    }

    if (err.driverError.code === 'ER_NO_DEFAULT_FOR_FIELD') {
      return customResponse(res, 400, null, 'Missing Fields in Request');
    }
  }

  // multer errors
  // if (err instanceof multer.MulterError) {
  //   return res.status(500).json({ status: err.code, error: err.message, data: null });
  // }

  // Send Internal Sever Error
  return customResponse(res, 500, null, IApiErrors.INTERNAL_SERVER_ERROR);
}
export default globalErrorHandling;
