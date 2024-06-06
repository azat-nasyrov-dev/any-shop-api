import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: "The user's email must not be empty" })
  @IsEmail()
  @IsString()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(24)
  @IsString()
  readonly password: string;
}
