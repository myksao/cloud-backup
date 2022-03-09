import { Controller, Post, Body, UseGuards, Request, Logger, Session } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { LocalAuthGuard } from 'src/common/guard/local-auth.guard';

@Controller('user')
export class UserController {
  private readonly logger: Logger;
  constructor(private readonly userService: UserService) {
    this.logger = new Logger(UserController.name);
  }

  @Public()
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.debug(createUserDto);
    const user = await this.userService.create(createUserDto);
    return {
      message: `Welcome ${user.name}`,
    };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Session() session: { authenticated?: true }, @Request() req): Promise<any> {
    this.logger.debug({
      login: req.user,
    });
    const result = await this.userService.login(req.user);
    session.authenticated = true;
    return result;
  }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
