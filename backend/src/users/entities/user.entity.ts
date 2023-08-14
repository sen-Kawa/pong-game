import { User, Status } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class UserEntity implements User {
	constructor(partial: Partial<UserEntity>) {
		Object.assign(this, partial);
	}

	@ApiProperty()
	id: number;

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

  @Exclude()
  avatarId: number

  @Exclude()
  refreshToken: string

  @Exclude()
  twoFactorAuthenticationSecret: string
}
