import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { ForecastController } from './controllers/forecast';
import { Application } from 'express';
import * as database from '@src/../infra/database';
import apiSchema from '@src/api.schema.json';
import swaggerUi from 'swagger-ui-express';
import { middleware } from 'express-openapi-validator';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/users';
import logger from './logger';
import pinoHttp from 'pino-http';
import cors from 'cors';
import { apiErrorValidator } from './middlewares/api-error-validator';
import ApiError from './util/errors/api-error';
import path from 'path';
import { BeachMongoDBRepository } from './repositories/beachMongoDBRepository';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.docsSetup();
    this.setupControllers();
    await this.databaseSetup();
    this.setupErrorHandlers();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
    this.app.use(
      pinoHttp({
        logger,
      })
    );
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupErrorHandlers(): void {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.app.use((err: any, req: any, res: any) => {
      if (
        err.status === 400 ||
        err.status === 401 ||
        err.status === 404 ||
        err.status === 409
      ) {
        res.status(err.status).send(
          ApiError.format({
            code: err.status,
            message: err.message,
          })
        );
      } else {
        apiErrorValidator(err, req, res);
      }
    });
  }

  private setupControllers(): void {
    const forecastController = new ForecastController(
      new BeachMongoDBRepository()
    );
    const beachesController = new BeachesController(
      new BeachMongoDBRepository()
    );
    const usersController = new UsersController();
    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    this.app.use(
      middleware({
        apiSpec: path.resolve(__dirname, 'api.schema.json'),
        validateRequests: true,
        validateResponses: false,
        ignorePaths: /\/\docs.*/,
      })
    );
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info('Server listening of port:' + this.port);
    });
  }
}
