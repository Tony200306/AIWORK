import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateQuestionCardDto } from '../dtos/onboarding-question.dto';


@Injectable()
export class OnboardingQuestionService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.questionCard.findMany({
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
        });
    }

    async findBySlug(slug: string) {
        const card = await this.prisma.questionCard.findUnique({
            where: { slug },
        });

        if (!card) {
            throw new NotFoundException(`Question card with slug "${slug}" not found`);
        }

        return card;
    }

    async findById(id: string) {
        const card = await this.prisma.questionCard.findUnique({
            where: { id },
        });

        if (!card) {
            throw new NotFoundException(`Question card with id "${id}" not found`);
        }

        return card;
    }

    async create(dto: CreateQuestionCardDto) {
        return this.prisma.questionCard.create({
            data: dto,
        });
    }


    async delete(id: string) {
        await this.findById(id);

        return this.prisma.questionCard.delete({
            where: { id },
        });
    }
}