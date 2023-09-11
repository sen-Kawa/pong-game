import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, Length } from 'class-validator'

export class FindUserDto {
  @Length(3)
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string
}
