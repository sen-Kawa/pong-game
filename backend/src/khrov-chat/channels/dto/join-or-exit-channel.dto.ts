import { IsNumber, IsNotEmpty, IsPositive, Matches, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export default class {
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly userId: number;

  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly chId: number;

  @Matches(/^[a-zA-Z\d]*$/)
  readonly password: string;

  @IsBoolean()
  readonly joinOrExit: boolean;
}
