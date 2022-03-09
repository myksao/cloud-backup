import { Expose } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @Expose()
  @IsDefined({
    message: (args) => {
      if (args.value === undefined || args.value === null) {
        return 'Email field is empty';
      } else {
        return 'The value in the email field is not an email address';
      }
    },
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @MinLength(8, {
    message: (args) => {
      if (args.value === undefined || args.value === null) {
        return 'Password field is empty';
      } else {
        return 'Password Too short, minimum length is ' + args.constraints[0] + ' characters';
      }
    },
  })
  password: string;
}
