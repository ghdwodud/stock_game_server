import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    uuid: string;
  };
}
