import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string

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
