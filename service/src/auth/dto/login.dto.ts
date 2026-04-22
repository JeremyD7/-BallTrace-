import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'account must only contain letters, numbers, "_" or "-"',
  })
  account!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password!: string;
}
