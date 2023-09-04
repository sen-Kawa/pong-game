import { IsNumber, IsNotEmpty, IsPositive, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export default class {
  @Matches(/^[a-zA-Z\d]{3,15}$/)
  readonly name: string;

  @Matches(/^[a-zA-Z\d?@ ,.'^\n]{10,42}$/)
  readonly desc: string;

  @Matches(/^public$|^private$|^password$/)
  readonly visibility: string;

  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])^[a-zA-Z\d]{6,20}$/)
  readonly password: string;

  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly userId: number;
}
