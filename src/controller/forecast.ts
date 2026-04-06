import { Controller, Get } from '@overnightjs/core';
import { BeachModel, Beach, Beach2 } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';

const forecast = new Forecast();

@Controller('forecast')
export class ForecastController {
  @Get('')
  public async getForecastForLogger(_: Request, res: Response): Promise<void> {
    try {
      const beaches: Beach[] = (await BeachModel.find()).map(
        (doc) => doc.toJSON() as unknown as Beach2
      );
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
