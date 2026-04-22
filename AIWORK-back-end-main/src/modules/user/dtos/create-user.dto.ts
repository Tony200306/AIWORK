import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, Matches, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
	@ApiProperty({ example: 'John Doe', description: 'User full name' })
	@IsString()
	@MinLength(2, { message: 'Name must be at least 2 characters long' })
	name: string;

	@ApiProperty({ example: 'john@example.com', description: 'User email address' })
	@IsEmail({}, { message: 'Please provide a valid email address' })
	email: string;

	@ApiProperty({ example: 'SecurePass123', description: 'User password (min 8 chars, must contain uppercase, lowercase, and number)' })
	@IsString()
	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	@Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
		message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
	})
	password: string;

	@ApiProperty({ enum: Role, required: false, description: 'User role (defaults to USER)' })
	@IsEnum(Role)
	@IsOptional()
	role?: Role;
}
