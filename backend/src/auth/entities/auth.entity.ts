import { ApiProperty } from '@nestjs/swagger'

export class AuthEntity {
  @ApiProperty()
  userId: number
  @ApiProperty()
  name: string
  @ApiProperty()
  userName: string
  @ApiProperty()
  user42Name: string
  @ApiProperty()
  email: string
  @ApiProperty()
  activated2FA: boolean
}
