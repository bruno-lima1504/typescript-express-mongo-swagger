import { Beach, BeachModel } from '@src/models/beach';
import { DefaultMongoDBRepostory } from './defaultMongoDBRepository';
import { BeachRepository, WithId } from '.';

export class BeachMongoDBRepository
  extends DefaultMongoDBRepostory<Beach>
  implements BeachRepository
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(beachModel?: any) {
    super(beachModel || BeachModel);
  }

  async findAllBeachesForUser(userId: string): Promise<WithId<Beach>[]> {
    return await this.find({ userId });
  }
}
