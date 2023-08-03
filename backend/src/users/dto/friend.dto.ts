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

export class FriendDto {
  @Length(3)
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  friendName: string
}
