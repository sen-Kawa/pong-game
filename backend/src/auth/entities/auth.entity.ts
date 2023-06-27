import { ApiProperty } from '@nestjs/swagger';

export class AuthEntity {
	@ApiProperty()
	userId: number;
	@ApiProperty()
	user: string;
	@ApiProperty()
	accessToken: string;
}
