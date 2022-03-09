import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger;
  constructor(private userService: UserService) {
    super({ usernameField: 'email' });
    this.logger = new Logger(LocalStrategy.name);
  }

  async validate(email: string, password: string): Promise<any> {
    this.logger.debug({
      email: email,
      password: password,
    });
    const user = await this.userService.validateUser({ email: email, password: password });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
