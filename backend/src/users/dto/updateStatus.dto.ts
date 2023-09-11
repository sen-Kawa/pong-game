import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { Status } from '@prisma/client'

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(Status)
  @ApiProperty()
  currentStatus: Status
}
