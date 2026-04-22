import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Logger,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { UserException } from '@errors/user.exceptions';
import { Roles } from '@decorators/roles.decorator';
import { CurrentUser } from '@decorators/current-user.decorator';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UpdateSchedulePreferenceDto } from '../dtos/update-schedule-preference.dto';
import { UpdateValuesStackDto } from '../dtos/update-values-stack.dto';
import { UserService } from '../services/user.service';

/**
 * User Controller - handles HTTP requests for user operations
 * Controllers should be thin - delegate business logic to services
 *
 * NOTE: All routes require JWT authentication by default
 * User authentication endpoints are in AuthController
 */
@ApiTags('User')
@ApiBearerAuth('JWT-auth')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user (Admin only)
   */
  @Post('/create')
  @Roles('admin')
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() body: CreateUserDto, @CurrentUser() currentUser) {
    try {
      // Check if user already exists
      const exists = await this.userService.existsByEmail(body.email);
      if (exists) {
        throw UserException.UserExist();
      }

      const user = await this.userService.create(body);
      const { password, ...userWithoutPassword } = user;

      this.logger.log(`User created by admin ${currentUser.email}: ${user.email}`);

      return {
        success: true,
        message: 'User created successfully',
        data: userWithoutPassword,
      };
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  @Get('/list')
  @ApiOperation({ summary: 'Get all users' })
  async getAll() {
    try {
      const users = await this.userService.getAll();
      const usersWithoutPassword = users.map(({ password, ...user }) => user);
      return {
        success: true,
        data: usersWithoutPassword,
        count: usersWithoutPassword.length,
      };
    } catch (error) {
      this.logger.error('Failed to get users', error);
      throw error;
    }
  }

  /**
   * Get single user by ID
   */
  @Get('/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne({ id: id });

      if (!user) {
        throw UserException.UserNotFound();
      }

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error) {
      this.logger.error(`Failed to get user ${id}`, error);
      throw error;
    }
  }

  /**
   * Update user
   */
  @Patch('/update/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({ type: UpdateUserDto })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    try {
      const user = await this.userService.update(id, body);
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'User updated successfully',
        data: userWithoutPassword,
      };
    } catch (error) {
      this.logger.error(`Failed to update user ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Delete user' })
  async delete(@Param('id') id: string) {
    try {
      // Check if user exists
      const exists = await this.userService.findOne({ id: id });
      if (!exists) {
        throw UserException.UserNotFound();
      }

      const user = await this.userService.delete(id);
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'User deleted successfully',
        data: userWithoutPassword,
      };
    } catch (error) {
      this.logger.error(`Failed to delete user ${id}`, error);
      throw error;
    }
  }

  // ==================== PROFILE (VALUES STACK) ====================

  /**
   * Update current user's profile (values stack)
   */
  @Patch('/me/profile')
  @ApiOperation({ summary: 'Update current user profile (values stack)' })
  @ApiBody({ type: UpdateValuesStackDto })
  async updateProfile(
    @Body() body: UpdateValuesStackDto,
    @CurrentUser() user: any,
  ) {
    try {
      if (!user?.id) {
        throw UserException.UserNotFound();
      }

      const result = await this.userService.updateValuesStack(user.id, body.valuesStack);

      return {
        success: true,
        message: 'Profile updated successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to update profile', error);
      throw error;
    }
  }

  // ==================== SCHEDULE PREFERENCE ====================

  /**
   * Get current user's schedule preference
   */
  @Get('/me/schedule-preference')
  @ApiOperation({ summary: 'Get current user schedule preference (capacity settings)' })
  async getSchedulePreference(@CurrentUser() user: any) {
    try {
      if (!user?.id) {
        throw UserException.UserNotFound();
      }

      const preference = await this.userService.getSchedulePreference(user.id);

      return {
        success: true,
        data: preference,
      };
    } catch (error) {
      this.logger.error('Failed to get schedule preference', error);
      throw error;
    }
  }

  /**
   * Update current user's schedule preference
   */
  @Patch('/me/schedule-preference')
  @ApiOperation({ summary: 'Update current user schedule preference (capacity settings)' })
  @ApiBody({ type: UpdateSchedulePreferenceDto })
  async updateSchedulePreference(
    @Body() body: UpdateSchedulePreferenceDto,
    @CurrentUser() user: any,
  ) {
    try {
      if (!user?.id) {
        throw UserException.UserNotFound();
      }

      const preference = await this.userService.updateSchedulePreference(user.id, body);

      return {
        success: true,
        message: 'Schedule preference updated successfully',
        data: preference,
      };
    } catch (error) {
      this.logger.error('Failed to update schedule preference', error);
      throw error;
    }
  }
}
