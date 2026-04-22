import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global Database Module
 * Provides PrismaService globally to all modules without needing to import it individually
 */
@Global()
@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class DatabaseModule {}
