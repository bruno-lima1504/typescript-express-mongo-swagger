import { ForecastPoint, StormGlass } from '@src/clients/stormGlass';
import { InternalError } from '@src/util/errors/internal-errors';
import { Beach } from '@src/models/beach';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecas processing: ${message}`);
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beachs: Beach[]
  ): Promise<TimeForecast[]> {
    try {
      const pointWithCorrectSources: BeachForecast[] = [];
      for (const beach of beachs) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
        const enrichedBeachData = this.enrichBeachData(points, beach);
        pointWithCorrectSources.push(...enrichedBeachData);
      }
      return this.mapForecastByTime(pointWithCorrectSources);
    } catch (error) {
      throw new ForecastProcessingInternalError(error.message);
    }
  }

  private enrichBeachData(points: ForecastPoint[], beach: Beach) {
    return points.map((e) => ({
      ...{},
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1,
      },
      ...e,
    }));
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];
    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }
    return forecastByTime;
  }
}
