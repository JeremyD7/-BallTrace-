import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
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

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(24)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;
}
