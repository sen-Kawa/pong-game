import { User, LOGIN_TYPE } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
	constructor(partial: Partial<UserEntity>) {
		Object.assign(this, partial);
	}
	
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	user42Name: string;

	@ApiProperty()
	userName: string;

	@ApiProperty()
	email: string;

	@Exclude()
	password: string;

	@ApiProperty()
	activated2FA: boolean;

	@Exclude()
	refreshToken: string;

	@ApiProperty()
	loginType: LOGIN_TYPE;

	@Exclude()
	twoFactorAuthenticationSecret: string;
}
