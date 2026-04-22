import { Module } from '@nestjs/common';
import { CalendarController } from './controllers/calendar.controller';
import { ScheduleEventController } from './controllers/schedule-event.controller';
import { BlockTemplateController } from './controllers/block-template.controller';
import { CalendarService } from './services/calendar.service';
import { ScheduleEventService } from './services/schedule-event.service';
import { BlockTemplateService } from './services/block-template.service';

@Module({
	controllers: [CalendarController, ScheduleEventController, BlockTemplateController],
	providers: [CalendarService, ScheduleEventService, BlockTemplateService],
	exports: [CalendarService, ScheduleEventService, BlockTemplateService],
})
export class CalendarModule {}
