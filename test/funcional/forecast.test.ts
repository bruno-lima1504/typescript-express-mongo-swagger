import { BeachModel, GeoPosition } from '@src/models/beach';
import { UserModel } from '@src/models/user';
import AuthService from '@src/services/auth';
import nock from 'nock';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormGlass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forescast_response_1_beach.json';

describe('Beach forecast functional tests', () => {
  const defaultUser = {
    name: 'John doe',
    email: 'john@mail.com',
    password: '1234',
  };
  let token: string;
  beforeEach(async () => {
    await BeachModel.deleteMany({});
    await UserModel.deleteMany({});
    const user = await new UserModel(defaultUser).save();
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      user: user.id,
    };
    await new BeachModel(defaultBeach).save();
    token = AuthService.generateToken(user.id);
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

    const { body, status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });
    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  }, 10000);

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query(true) // aceita qualquer query (melhor pra teste)
      .replyWithError('Something went wrong');

    const { status } = await global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });

    expect(status).toBe(500);
  }, 20000);
});
