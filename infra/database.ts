import config, { Config } from 'config';
import mongoose, { Mongoose } from 'mongoose';

const dbConfig: Config = config.get('App.database');

export const connect = async (): Promise<Mongoose> => {
  // Prioriza a variável de ambiente, se não houver, usa o arquivo de config
  const url = process.env.MONGO_URL || dbConfig.get<string>('mongoUrl');

  console.log(`[Database] Mode: ${process.env.NODE_ENV}`);
  console.log(
    `[Database] Connecting to: ${url.replace(/:([^:@]+)@/, ':****@')}`
  ); // Log seguro ocultando a senha

  return await mongoose.connect(url);
};

export const close = (): Promise<void> => mongoose.connection.close();
