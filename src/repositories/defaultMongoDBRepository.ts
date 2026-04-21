import mongoose, { Model } from 'mongoose';
import { Repository } from './repository';
import { WithId, FilterOptions } from '.';
import { BaseModel } from '@src/models';
import { CUSTOM_VALIDATION } from '@src/models/user';
import {
  DatabaseValidationError,
  DatabaseUnknowClientError,
  DatabaseInternalError,
} from './repository';
import logger from '@src/logger';

export abstract class DefaultMongoDBRepostory<
  T extends BaseModel,
  M extends Model<T> = Model<T>,
> extends Repository<T> {
  constructor(protected model: M) {
    super();
  }

  public async create(data: T): Promise<WithId<T>> {
    try {
      const model = new this.model(data);
      const createdData = await model.save();
      return createdData.toJSON<WithId<T>>();
    } catch (error) {
      this.handleError(error);
    }
  }

  public async find(filter: FilterOptions) {
    try {
      const data = await this.model.find(filter);
      return data.map((d) => d.toJSON<WithId<T>>());
    } catch (error) {
      this.handleError(error);
    }
  }

  protected handleError(error: unknown): never {
    if (error instanceof mongoose.Error.ValidationError) {
      const duplicatedKindErrors = Object.values(error.errors).filter(
        (err) =>
          err.name == 'ValidatorError' &&
          err.kind == CUSTOM_VALIDATION.DUPLICATED
      );
      if (duplicatedKindErrors.length) {
        throw new DatabaseValidationError(error.message);
      }
      throw new DatabaseUnknowClientError(error.message);
    }
    logger.warn(`Database error ${error}`);

    throw new DatabaseInternalError(
      'Something unexpexted happend to the database'
    );
  }
}
