import pino from 'pino';
import config from 'config';

export default pino({
  enabled: config.get<boolean>('App.logger.enabled'),
  level: config.get<string>('App.logger.level'),
});
