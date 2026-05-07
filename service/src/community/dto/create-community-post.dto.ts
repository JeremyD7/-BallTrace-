import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  MAX_POST_MEDIA,
  MAX_POST_TAGS,
  POST_VISIBILITY_FOLLOWERS,
  POST_VISIBILITY_PUBLIC,
} from '../community.constants';

export class CommunityPostMediaDto {
  @IsString()
  @MaxLength(255)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  type?: string;
}

export class CreateCommunityPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_POST_MEDIA)
  @ValidateNested({ each: true })
  @Type(() => CommunityPostMediaDto)
  media?: CommunityPostMediaDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_POST_TAGS)
  @IsString({ each: true })
  @MaxLength(32, { each: true })
  tags?: string[];

  @IsOptional()
  @IsIn([POST_VISIBILITY_PUBLIC, POST_VISIBILITY_FOLLOWERS])
  visibility?: string;

  @IsOptional()
  @IsBoolean()
  allowComment?: boolean;

  @IsOptional()
  @IsBoolean()
  syncToCommunity?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
