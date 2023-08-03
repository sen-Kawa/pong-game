import { ApiProperty } from '@nestjs/swagger'

export class PassEntity {
  @ApiProperty()
  username: string
  @ApiProperty()
  password: string
}
