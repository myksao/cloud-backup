import { Injectable } from '@nestjs/common';
import { compare, DEFAULT_COST, hash } from '@node-rs/bcrypt';

@Injectable()
export class BcryptService {
  async hashPassword(password: string): Promise<string> {
    const hashed = await hash(password, DEFAULT_COST);
    return hashed;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    const match = await compare(password, hash);
    return match;
  }
}
