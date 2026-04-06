import config, { Config } from 'config';
import mongoose, { Mongoose } from 'mongoose';

const dbConfig: Config = config.get('App.database');

export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect(dbConfig.get('mongoUrl'));

export const close = (): Promise<void> => mongoose.connection.close();
