import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsEmail, Length, IsAlpha } from 'class-validator'

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Length(3)
  name: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Length(3)
  @IsAlpha()
  displayName: string

  @IsString()
  @ApiProperty({ required: false })
  user42Name: string

  @IsOptional()
  @IsEmail()
  @ApiProperty({ required: false })
  email: string

  @ApiProperty({ required: false })
  activated2FA: boolean

  @IsString()
  password: string
}
