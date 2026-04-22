import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateFeedbackDto } from '../dtos';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFeedbackDto) {
    const feedback = await this.prisma.sprintFeedback.create({
      data: {
        userId,
        sprintId: dto.sprintId,
        difficulty: dto.difficulty,
        slowdown: dto.slowdown,
      },
    });

    this.logger.log(`Feedback created: ${feedback.id} by user ${userId}`);
    return feedback;
  }

  async findAllByUser(userId: string) {
    return this.prisma.sprintFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySprint(userId: string, sprintId: string) {
    return this.prisma.sprintFeedback.findFirst({
      where: { userId, sprintId },
    });
  }
}
