import { Controller, Post, Body, UseGuards, Logger, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import { LocalAuthGuard } from '@guards/local-auth.guard';
import { Public } from '@decorators/public.decorator';
import { CurrentUser } from '@decorators/current-user.decorator';

import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { OAuthLoginDto } from '../dtos/oauth-login.dto';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   */
  @Public()
  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() body: RegisterDto) {
    try {
      const result = await this.authService.register(body);

      return {
        success: true,
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  async login(@CurrentUser() user) {
    try {
      const result = await this.authService.login(user);
      return {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  /**
   * OAuth login/register
   * Auto-register if user doesn't exist, login if exists
   */
  @Public()
  @Post('/oauth-login')
  @ApiOperation({
    summary: 'OAuth login/register',
    description: 'Login with OAuth provider (Google, GitHub). Auto-creates account if user does not exist.',
  })
  @ApiBody({ type: OAuthLoginDto })
  async oauthLogin(@Body() body: OAuthLoginDto) {
    try {
      const result = await this.authService.oauthLogin(body);
      return {
        success: true,
        message: 'OAuth authentication successful',
        data: result,
      };
    } catch (error) {
      this.logger.error('OAuth login failed', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  @Get('/profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user) {
    try {
      this.logger.debug(`Fetching profile for user: ${user?.id}`);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      this.logger.error('Failed to get profile', error);
      throw error;
    }
  }
}
