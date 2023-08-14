import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  Length,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNumber,
  IsPositive
} from 'class-validator'

export class FileDto {
  @ApiProperty()
  fileName: string
}
