import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserException } from '@errors/user.exceptions';
import { PrismaService } from '@shared/database/prisma.service';

import { Role } from '@prisma/client';
import { RegisterDto } from '../dtos/register.dto';
import { OAuthLoginDto } from '../dtos/oauth-login.dto';

/**
 * Authentication service
 * Handles user registration, login, and validation
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Register a new user
   */
  async register(data: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw UserException.UserExist();
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role || Role.USER,
        },
      });

      this.logger.log(`User registered: ${user.email}`);

      // Remove password from response
      const { password, ...result } = user;

      // Generate JWT token
      const token = await this.generateToken(user.id, user.email);

      return {
        user: result,
        access_token: token,
      };
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(user: any) {
    try {
      const token = await this.generateToken(user.id, user.email);

      this.logger.log(`User logged in: ${user.email}`);

      return {
        user,
        access_token: token,
      };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  /**
   * Validate user credentials
   * Used by LocalStrategy
   */
  async validateUser(email: string, password: string) {
    try {


      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);


      if (!isPasswordValid) {
        return null;
      }

      // Remove password from response
      const { password: _, ...result } = user;

      return result;
    } catch (error) {
      this.logger.error('User validation failed', error);
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  private async generateToken(userId: string, email: string): Promise<string> {
    const payload = { email, sub: userId };
    return this.jwtService.sign(payload);
  }

  /**
   * OAuth login/register
   * If user exists with email -> login
   * If user doesn't exist -> auto register (no password required)
   */
  async oauthLogin(data: OAuthLoginDto) {
    try {
      // Check if user exists by email
      let user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (user) {
        // User exists -> update OAuth info if needed and login
        this.logger.log(`OAuth login for existing user: ${user.email}`);

        // Update provider info if it's different
        if (user.provider !== data.provider || user.providerId !== data.provider_id) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              provider: data.provider,
              providerId: data.provider_id,
              avatarUrl: data.avatar_url,
              name: data.name, // Update name from OAuth
            },
          });
        }
      } else {
        // User doesn't exist -> auto register
        this.logger.log(`OAuth auto-register for new user: ${data.email}`);

        user = await this.prisma.user.create({
          data: {
            email: data.email,
            name: data.name,
            password: null, // No password for OAuth users
            role: Role.USER,
            provider: data.provider,
            providerId: data.provider_id,
            avatarUrl: data.avatar_url,
          },
        });
      }

      // Link braindump to user account if braindump_id is provided
      if (data.braindump_id) {
        try {
          await this.prisma.brainDump.update({
            where: { id: data.braindump_id },
            data: { userId: user.id },
          });
          this.logger.log(`Linked braindump ${data.braindump_id} to user ${user.id}`);
        } catch (braindumpError) {
          this.logger.warn(`Failed to link braindump ${data.braindump_id} to user`, braindumpError);
          // Don't fail the entire login if braindump linking fails
        }
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Generate JWT token
      const token = await this.generateToken(user.id, user.email);

      this.logger.log(`OAuth authentication successful: ${user.email}`);

      return {
        user: userWithoutPassword,
        access_token: token,
      };
    } catch (error) {
      this.logger.error('OAuth login failed', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
