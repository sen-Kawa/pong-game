import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class TFAAuthGuard extends AuthGuard('2fa') {}
