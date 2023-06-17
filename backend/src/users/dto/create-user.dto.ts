import { IsNotEmpty, MinLength } from "class-validator";

export class CreateCustomerDTO {
	@IsNotEmpty()
  	@MinLength(3)
    readonly first_name: string;

	@IsNotEmpty()
  	@MinLength(3)
    readonly last_name: string;

}