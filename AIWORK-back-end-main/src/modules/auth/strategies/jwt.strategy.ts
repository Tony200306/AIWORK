import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import config_env from 'src/config';

import { UserService } from '@modules/user/services/user.service';

/**
 * JWT strategy for token-based authentication
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config_env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  /**
   * Validate JWT payload and return user
   */
  async validate(payload: any) {
    try {
      const userId = String(payload.sub);
      const user = await this.userService.findOne({ id: userId });

      if (!user) {
        this.logger.warn(`User not found for JWT payload: ${userId}`);
        throw new UnauthorizedException('Invalid token');
      }

      // Remove sensitive data
      const { password, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error('JWT validation failed', error);
      throw error;
    }
  }
}
