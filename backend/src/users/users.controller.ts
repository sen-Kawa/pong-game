import { Controller, Get, Res, HttpStatus, Post, Body, Put, Query, NotFoundException, Delete, Param } from '@nestjs/common';
import { CreateCustomerDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';
	
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  
  @Get('/users')
  async getAllUsers(@Res() res) {
	const users = await this.userService.getAllUser();
       return res.status(HttpStatus.OK).json(users);
  }
}
