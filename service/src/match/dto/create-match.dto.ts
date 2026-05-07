import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const MATCH_TYPES = ['1v1', '3v3', '半场', '全场'] as const;
export const LEVEL_OPTIONS = ['新手友好', '中级', '进阶', '娱乐局'] as const;
export const GENDER_OPTIONS = ['不限男女', '仅限男生', '仅限女生'] as const;

export class CreateMatchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  area!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  courtName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  matchDate!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  startTime!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  endTime!: string;

  @IsIn(MATCH_TYPES)
  matchType!: string;

  @IsIn(LEVEL_OPTIONS)
  level!: string;

  @IsOptional()
  @IsIn(GENDER_OPTIONS)
  genderLimit?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(20)
  total?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  price?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  feeRule?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slogan!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  note?: string;
}