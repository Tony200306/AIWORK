import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ClientRevenueRange, ClientRelationshipState } from '@prisma/client';

export class CreateClientDto {
	@ApiProperty({ example: 'Acme Corp', description: 'Client name' })
	@IsString()
	name: string;

	@ApiPropertyOptional({
		enum: ClientRevenueRange,
		description: 'Revenue range (UNDER_3K, K3_TO_7K, K7_TO_12K, K12_PLUS)',
	})
	@IsOptional()
	@IsEnum(ClientRevenueRange)
	revenueRange?: ClientRevenueRange;

	@ApiPropertyOptional({
		enum: ClientRelationshipState,
		description: 'Relationship state (THRIVING, STABLE, UNDER_PRESSURE, AT_RISK)',
	})
	@IsOptional()
	@IsEnum(ClientRelationshipState)
	relationshipState?: ClientRelationshipState;
}
