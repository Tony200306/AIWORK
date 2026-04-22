import { ModelBase } from "./ModelBase";

export enum QuestionType {
    SINGLE_SELECT = "SINGLE_SELECT",
    MULTI_SELECT = "MULTI_SELECT",
    SLIDER = "SLIDER",
    TEXT_INPUT = "TEXT_INPUT",
    NUMBER_INPUT = "NUMBER_INPUT",
}

// Frontend shape mapped from Prisma model `question_card`
export interface OnboardingQuestion extends ModelBase {
    slug: string;
    orderIndex: number;
    title: string;
    subtitle?: string | null;
    question: string;
    type: QuestionType;
    options?: Record<string, unknown> | Record<string, unknown>[] | null; // JSONB
    config?: Record<string, unknown> | null; // JSONB
    isActive: boolean;
}
