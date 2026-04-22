import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { PrismaService } from '../../../src/shared/database/prisma.service';
import { RedisService } from '../../../src/shared/cache/redis/redis.service';

@Module({
	controllers: [WorkerController],
	providers: [WorkerService, PrismaService, RedisService],
})
export class WorkerModule {}
