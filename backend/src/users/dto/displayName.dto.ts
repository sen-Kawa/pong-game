import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, Length, IsAlpha } from 'class-validator'

export class DisplayNameDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Length(3)
  @IsAlpha()
  displayName: string
}
