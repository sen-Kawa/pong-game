// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class UsersService {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDTO } from './dto/create-user.dto';
import { User } from './users.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) { }
    // get all users
    async getAllUser(): Promise<User[]> {
        const users = await this.usersRepository.find();
        return users;
    }

}