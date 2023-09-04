import { IsNumber, IsNotEmpty, IsPositive, Matches } from 'class-validator';
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

  @Matches(/^[a-zA-Z\d?@ ,.'^\n]{3,16}$/)
  readonly userName: string;
}
