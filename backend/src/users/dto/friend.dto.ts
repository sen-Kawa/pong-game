import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, Length } from 'class-validator'

export class FriendDto {
  @Length(3)
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  friendName: string
}
