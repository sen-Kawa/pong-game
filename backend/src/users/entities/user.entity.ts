import { User, Status } from '@prisma/client'
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial)
  }

  @ApiHideProperty()
  @Exclude()
  id: number

  @ApiProperty()
  displayName: string

  @ApiProperty()
  name: string

  @ApiProperty()
  userName: string

  @ApiProperty()
  email: string

  @ApiProperty()
  activated2FA: boolean

  @ApiProperty()
  currentStatus: Status

  @ApiHideProperty()
  @Exclude()
  refreshToken: string

  @ApiHideProperty()
  @Exclude()
  twoFactorAuthenticationSecret: string

  @ApiProperty()
  wins: number

  @ApiProperty()
  losses: number

  @ApiProperty()
  ratio: number
}
