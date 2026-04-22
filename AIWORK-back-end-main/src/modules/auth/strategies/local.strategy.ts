import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../services/auth.service';

/**
 * Local strategy for username/password authentication
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * Validate user credentials
   */
  async validate(email: string, password: string) {
    try {
      const user = await this.authService.validateUser(email, password);

      if (!user) {
        this.logger.warn(`Failed login attempt for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`User authenticated: ${email}`);
      return user;
    } catch (error) {
      this.logger.error('Login validation failed', error);
      throw error;
    }
  }
}
