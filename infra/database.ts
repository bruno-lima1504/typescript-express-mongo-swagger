import logger from '@src/logger';
import config, { Config } from 'config';
import mongoose, { Mongoose } from 'mongoose';

const dbConfig: Config = config.get('App.database');

export const connect = async (): Promise<Mongoose> => {
  const url = dbConfig.get<string>('mongoUrl');
  logger.info(url);

  return await mongoose.connect(url);
};

export const close = (): Promise<void> => mongoose.connection.close();
