import { BeachModel } from '@src/models/beach';
import { UserModel } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beaches function tests', () => {
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
    token = AuthService.generateToken(user.toJSON());
  });

  describe('When creating a beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };
      const response = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });

    it('should throw 422 whe there is a validation error', async () => {
      const newBeachInvalidLat = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };
      const response = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeachInvalidLat);

      expect(response.status).toBe(422);

      expect(response.body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
      });
    });

    it.skip('should return 500 when there is any erro other than validation error', async () => {
      // TODO
    });
  });
});
