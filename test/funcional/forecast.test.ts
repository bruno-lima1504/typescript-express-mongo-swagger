import { BeachModel, BeachPosition } from '@src/models/beach';
import nock from 'nock';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormGlass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forescast_response_1_beach.json';

describe('Beach forecast functional tests', () => {
  beforeEach(async () => {
    await BeachModel.deleteMany({});
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: BeachPosition.E,
    };
    const beach = new BeachModel(defaultBeach);
    await beach.save();
  });

  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        authorization: 'test-token',
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query(true) // 🔥 aceita qualquer query (melhor pra teste)
      .reply(200, stormGlassWeather3HoursFixture);

    const { body, status } = await global.testRequest.get('/forecast');
    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  }, 10000);

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        authorization: 'test-token',
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query(true) // 🔥 aceita qualquer query (melhor pra teste)
      .replyWithError('Something went wrong');

    const { status } = await global.testRequest.get('/forecast');

    expect(status).toBe(500);
  }, 15000);
});
