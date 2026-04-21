import { BaseRepository, FilterOptions, WithId } from '.';

export class DataBaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class DatabaseValidationError extends DataBaseError {}

export class DatabaseUnknowClientError extends DataBaseError {}

export class DatabaseInternalError extends DataBaseError {}

export abstract class Repository<T> implements BaseRepository<T> {
  public abstract create(data: T): Promise<WithId<T>>;
  public abstract find(options: FilterOptions): Promise<WithId<T>[]>;
}
