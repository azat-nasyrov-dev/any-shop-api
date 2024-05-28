import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  @IsString()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly displayName?: string;

  @IsOptional()
  @MinLength(6)
  @MaxLength(12)
  @IsString()
  readonly password?: string;
}
