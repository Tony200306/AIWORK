import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export enum OAuthProvider {
	GOOGLE = 'google',
	GITHUB = 'github',
}

export class OAuthLoginDto {
	@ApiProperty({
		example: 'user@example.com',
		description: 'User email from OAuth provider',
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		example: 'google',
		enum: OAuthProvider,
		description: 'OAuth provider name',
	})
	@IsEnum(OAuthProvider)
	provider: OAuthProvider;

	@ApiProperty({
		example: '1234567890',
		description: 'User ID from OAuth provider (e.g., Stack Auth user ID)',
	})
	@IsString()
	provider_id: string;

	@ApiProperty({
		example: 'John Doe',
		description: 'User name from OAuth provider',
	})
	@IsString()
	name: string;

	@ApiProperty({
		example: 'https://lh3.googleusercontent.com/a/example',
		description: 'User avatar URL from OAuth provider',
		required: false,
	})
	@IsString()
	@IsOptional()
	avatar_url?: string;

	@ApiProperty({
		example: '123e4567-e89b-12d3-a456-426614174000',
		description: 'Optional braindump ID to link to user account',
		required: false,
	})
	@IsString()
	@IsOptional()
	braindump_id?: string;
}
