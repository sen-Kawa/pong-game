import { ApiProperty } from '@nestjs/swagger';
import { Game } from '@prisma/client';

export class GameEntity implements Game {
	@ApiProperty()
	id: number;

	@ApiProperty()
	playerTwoName: string;

	@ApiProperty()
	playerOneName: string;
}
