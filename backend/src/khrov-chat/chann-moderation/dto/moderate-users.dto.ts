import { IsNumber, IsNotEmpty, IsPositive, Matches, IsDate, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export default class {
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly adminId: number;

  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly chId: number;

  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly userId: number;

  @Matches(/^setAsAdmin$|^ban$|^kick$|^mute$/)
  readonly action: string;

  @IsDateString()
  readonly mutedUntil: Date;
}
