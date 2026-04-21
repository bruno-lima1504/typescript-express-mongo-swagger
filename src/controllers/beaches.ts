import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Request, Response } from 'express';
import { BaseController } from '.';
import { BeachRepository } from '@src/repositories';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  constructor(private beachRepository: BeachRepository) {
    super();
  }

  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.beachRepository.create({
        ...req.body,
        ...{ user: req.context?.userId },
      });
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateUpdatedErrorResponse(res, error);
    }
  }
}
