import { IsNumber, IsNotEmpty, IsPositive, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export default class {
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly userId: number;

  @Matches(/^[a-zA-Z\d]{2,}$/)
  readonly key: string;
}
