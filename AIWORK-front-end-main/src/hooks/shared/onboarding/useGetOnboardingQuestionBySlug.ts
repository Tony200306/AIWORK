import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import { getOnboardingQuestion } from "@/services/onboarding-question/getOnboardingQuestion";
import { OnboardingQuestion } from "@/models/OnboardingQuestion";
import { useQuery } from "@tanstack/react-query";

export const useGetOnboardingQuestionBySlug = (slug: string) => {
  return useQuery<ResponseDetailSuccess<OnboardingQuestion>>({
    queryKey: ["onboarding-question", slug],
    queryFn: () => getOnboardingQuestion(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};