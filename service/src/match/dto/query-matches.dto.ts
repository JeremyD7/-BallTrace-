import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class QueryMatchesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}