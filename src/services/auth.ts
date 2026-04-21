import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';

export interface JwtToken {
  sub: string;
}

export default class AuthService {
  public static async hashPassword(password: string): Promise<string> {
    const salt = process.env.NODE_ENV === 'production' ? 14 : 1;
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static generateToken(sub: string): string {
    const secret = config.get<string>('App.auth.key');
    const expiresIn = config.get<number>('App.auth.tokenExpiresIn');

    return jwt.sign({ sub }, secret, {
      expiresIn,
    });
  }

  public static decodeToken(token: string): JwtToken {
    return jwt.verify(token, config.get('App.auth.key')) as JwtToken;
  }
}
