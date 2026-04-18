import { UserModel } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Users function tests', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe('When creating a new user', () => {
    it('should succesfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'John doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.statusCode).toBe(201);
      await expect(
        AuthService.comparePasswords(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
    });
    it('Should throw 422 when there is a validation error', async () => {
      const newInvalidUser = {
        email: 'john@mail.com',
        password: '1234',
      };

      const response = await global.testRequest
        .post('/users')
        .send(newInvalidUser);
      expect(response.status).toBe(422);

      expect(response.body).toEqual({
        code: 422,
        message: 'User validation failed: name: Path `name` is required.',
        error: 'Unprocessable Entity',
      });
    });
    it('Should return 409 when the email already exists', async () => {
      const newUser = {
        name: 'John doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        message: 'User validation failed: email: already exists in database.',
        error: 'Conflict',
      });
    });
  });

  describe('When authenticating a use', () => {
    it('shloud generate a token for a valid user', async () => {
      const newUser = {
        name: 'John doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await new UserModel(newUser).save();

      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });

      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });
    it('Should return UNAUTHORIZED if the user with the given email is not found', async () => {
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: 'invalid-mail@test.com', password: '1234' });

      expect(response.status).toBe(401);
    });
    it('Should return UNAUTHORIZED if the user is found but the password does not match', async () => {
      const newUser = {
        name: 'John doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await new UserModel(newUser).save();

      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: 'invalid_password' });

      expect(response.status).toBe(401);
    });
  });
});
