import {
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class MessageContentDto {
  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  text?: string;
}

class MessageDto {
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  contentObj?: MessageContentDto;
}

export class GenerateTextDto {
  @IsString()
  @IsOptional()
  prompt?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages?: MessageDto[];
}
