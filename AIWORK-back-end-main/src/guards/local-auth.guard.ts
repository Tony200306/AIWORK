import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for local authentication (email/password)
 * Uses the Local strategy
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
