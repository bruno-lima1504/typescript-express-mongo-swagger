import {
  ClassMiddleware,
  Controller,
  Get,
  Middleware,
} from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { BeachModel, Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';
import logger from '@src/logger';
import { BaseController } from '.';
import rateLimit from 'express-rate-limit';
import ApiError from '@src/util/errors/api-error';

const forecast = new Forecast();

const maxRequestsPerMinute = process.env.NODE_ENV === 'test' ? 1000 : 10;

const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: maxRequestsPerMinute, // limit each IP to 5 requests per windowMs
  handler(_: Request, res: Response): void {
    res.status(429).send(
      ApiError.format({
        code: 429,
        message: 'Too Many requests to the /forecast endpoint.',
      })
    );
  },
});

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  @Get('')
  @Middleware(rateLimiter)
  public async getForecastForLogger(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches: Beach[] = await BeachModel.find({
        user: req.context?.userId,
      });
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      logger.error(error);
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
