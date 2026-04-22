import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { WorkerService } from './worker.service';
import { IFileEventMessage } from '../../../src/modules/braindump/interfaces/job-message.interface';

@Controller()
export class WorkerController {
	private readonly logger = new Logger(WorkerController.name);

	constructor(private readonly workerService: WorkerService) {}

	@MessagePattern('app-file-event')
	async handleFileEvent(
		@Payload() message: IFileEventMessage,
		@Ctx() context: RmqContext,
	): Promise<void> {
		const channel = context.getChannelRef();
		const originalMsg = context.getMessage();

		this.logger.log(`Received file event: job=${message.jobId}, asset=${message.assetId}, status=${message.status}`);

		try {
			await this.workerService.processFileEvent(message);
			channel.ack(originalMsg);
			this.logger.log(`Successfully processed file event for job ${message.jobId}`);
		} catch (error) {
			this.logger.error(`Failed to process file event for job ${message.jobId}`, error);
			// Requeue the message on failure
			channel.nack(originalMsg, false, true);
		}
	}
}
