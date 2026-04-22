import { Module } from '@nestjs/common';
import { StorageModule as SharedStorageModule } from '@shared/storage/storage.module';
import { StorageController } from './controllers/storage.controller';

@Module({
	imports: [SharedStorageModule],
	controllers: [StorageController],
})
export class StorageModule {}

