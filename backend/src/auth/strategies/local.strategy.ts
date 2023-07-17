import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UserResponseModel } from "src/auth/model/user.response.model";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy,"local") {
    constructor(private authService:AuthService){
        super();
    }

    async validate(username:string, password:string): Promise<any>{
        var user = await this.authService.validateUser(username, password);
        if(user == null){
            throw new UnauthorizedException();
        }
        return user;
    }
}