import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: "The user's email must not be empty" })
  @IsEmail()
  @IsString()
  readonly email: string;

  @IsNotEmpty({ message: 'The user must have a name' })
  @IsString()
  readonly displayName: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(12)
  @IsString()
  readonly password: string;
}
