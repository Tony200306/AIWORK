"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RouteConfig } from "@/constants/RouteConfig";
import { useOnboardingBraindumpStore } from "@/stores/onboardingBraindumpStore";
import {
  calculateEffectivenessScore,
  getArchetypeTextFromScore,
  getArchetypeImageFromScore,
  getArchetypeColorFromScore,
  getArchetypeDescriptionFromScore,
  getArchetypeInstructionsFromScore,
  type CapacityState,
  type BreakPattern,
} from "@/utils/calculateEffectiveness";

// Helper function to map capacity feeling value to capacity state
const mapCapacityFeelingToState = (value: number): CapacityState => {
  if (value >= 70 && value <= 80) return 'breathing_room';
  if (value >= 85 && value <= 90) return 'tight_fit';
  if (value >= 95 && value <= 100) return 'overbooked';
  // Default fallback
  return 'tight_fit';
};

// Helper function to map consequences option to break pattern
const mapConsequencesToBreakPattern = (optionId: number): BreakPattern => {
  // Based on typical consequences question options:
  // 1-2: priority_break (missing deadlines, quality drops)
  // 3-4: energy_break (burnout, health issues)
  if (optionId <= 2) return 'priority_break';
  return 'energy_break';
};

export default function CapacityReportPage() {
  const [isHelpful, setIsHelpful] = useState(false);
  const router = useRouter();
  const { data: braindumpData } = useOnboardingBraindumpStore();

  const handleSignUpClick = () => {
    // router.push(RouteConfig.LoginPage.path);
    router.push("https://www.getvantum.com");
  };

  // Extract data from onboarding store and calculate effectiveness score
  const effectivenessResult = useMemo(() => {
    // Get capacity feeling value (from weekly-hours page)
    const capacityFeelingQ = braindumpData.questions.find(
      q => q.slug === 'weekly-hours'
    );
    const capacityFeelingValue = capacityFeelingQ
      ? parseInt(capacityFeelingQ.answer.split('%')[0])
      : 85;

    // Get task count
    const task_count = braindumpData.selected_tasks.length || 0;

    // Get consequences (break pattern) from task-timeline page
    const consequencesQ = braindumpData.questions.find(
      q => q.slug === 'task-timeline'
    );
    const consequencesValue = consequencesQ
      ? parseInt(consequencesQ.answer) || 1
      : 1;

    // Map values to types
    const capacity_state = mapCapacityFeelingToState(capacityFeelingValue);
    const break_pattern = mapConsequencesToBreakPattern(consequencesValue);

    // Debug logging
    console.log('🔍 Effectiveness Score Inputs:', {
      capacityFeelingValue,
      capacity_state,
      task_count,
      consequencesValue,
      break_pattern,
      questions: braindumpData.questions,
      tasks: braindumpData.selected_tasks
    });

    // Calculate effectiveness score
    return calculateEffectivenessScore({
      capacity_state,
      task_count,
      break_pattern,
    });
  }, [braindumpData]);

  // Get score description based on score value
  const getScoreDescription = (score: number) => {
    if (score >= 720) return { text: "quite impressive", color: "text-green-500" };
    if (score >= 650) return { text: "above average", color: "text-emerald-500" };
    if (score >= 600) return { text: "decent", color: "text-yellow-500" };
    if (score >= 550) return { text: "under pressure", color: "text-orange-500" };
    if (score >= 450) return { text: "concerning", color: "text-red-500" };
    return { text: "quite low actually", color: "text-red-600" };
  };

  const scoreDesc = getScoreDescription(effectivenessResult.score);

  // Get archetype instructions
  const instructions = getArchetypeInstructionsFromScore(effectivenessResult.score);

  // Calculate gauge rotation based on score (250-850 range)
  const getGaugeRotation = (score: number) => {
    const minScore = 250;
    const maxScore = 850;
    const percentage = ((score - minScore) / (maxScore - minScore)) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  const gaugePercentage = getGaugeRotation(effectivenessResult.score);

  return (
    <div className="flex-1 flex flex-col min-h-0 items-center px-4 md:px-6 lg:px-8 pb-8 md:pb-12">
      <div className="flex-1 flex flex-col min-h-0 w-full max-w-5xl">
        {/* Top Section - Result Card */}
        <div className="bg-popover-foreground rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 md:items-center">
            {/* Avatar */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-[#FF6B6B] flex items-center justify-center">
                <Image
                  src={getArchetypeImageFromScore(effectivenessResult.score)}
                  alt={getArchetypeTextFromScore(effectivenessResult.score)}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Result Text */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-base md:text-lg mb-1">Hey, you are an:</p>
              <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-linear-to-r ${getArchetypeColorFromScore(effectivenessResult.score)} bg-clip-text text-transparent`}>
                {getArchetypeTextFromScore(effectivenessResult.score)}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                {getArchetypeDescriptionFromScore(effectivenessResult.score)}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Score & Details */}
        <div className="rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-10 flex-1 ">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
            {/* Left - Effectiveness Score */}
            <div className="w-full lg:w-64 shrink-0">
              <p className="text-xs text-muted-foreground mb-1">
                The Vantum Wordmark
              </p>
              <h2 className="text-base md:text-lg lg:text-xl font-bold pb-2 border-border border-b mb-4 md:mb-6 lg:mb-8">Effectiveness Score</h2>

              {/* Gauge */}
              <div className="relative w-full max-w-[200px] h-24 md:h-28 lg:h-32 mx-auto mb-3 md:mb-4">
                {/* Gauge Arc Background */}
                <svg
                  className="w-full h-auto"
                  viewBox="0 0 338 169"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask id="path-1-inside-1_389_33812" fill="white">
                    <path d="M8.84476 168.733C3.83467 168.733 -0.251751 164.668 0.0121755 159.665C1.01933 140.573 5.20142 121.771 12.4007 104.066C20.7373 83.5642 32.9566 64.9357 48.3607 49.2443C63.7649 33.5528 82.0522 21.1057 102.179 12.6135C119.456 5.32364 137.798 1.07072 156.425 0.0126411C161.521 -0.27678 165.661 3.88777 165.661 8.99131V8.99131C165.661 14.0948 161.52 18.2014 156.427 18.5263C140.183 19.5626 124.197 23.3273 109.122 29.6883C91.1965 37.2516 74.9093 48.3374 61.1899 62.3127C47.4705 76.288 36.5876 92.879 29.1628 111.139C22.8754 126.601 19.1719 143.003 18.1846 159.666C17.8883 164.668 13.8548 168.733 8.84476 168.733V168.733Z" />
                  </mask>
                  <path
                    d="M8.84476 168.733C3.83467 168.733 -0.251751 164.668 0.0121755 159.665C1.01933 140.573 5.20142 121.771 12.4007 104.066C20.7373 83.5642 32.9566 64.9357 48.3607 49.2443C63.7649 33.5528 82.0522 21.1057 102.179 12.6135C119.456 5.32364 137.798 1.07072 156.425 0.0126411C161.521 -0.27678 165.661 3.88777 165.661 8.99131V8.99131C165.661 14.0948 161.52 18.2014 156.427 18.5263C140.183 19.5626 124.197 23.3273 109.122 29.6883C91.1965 37.2516 74.9093 48.3374 61.1899 62.3127C47.4705 76.288 36.5876 92.879 29.1628 111.139C22.8754 126.601 19.1719 143.003 18.1846 159.666C17.8883 164.668 13.8548 168.733 8.84476 168.733V168.733Z"
                    stroke={gaugePercentage >= 0 ? "#FF718B" : "#4A4A4A"}
                    strokeWidth="28.3966"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    mask="url(#path-1-inside-1_389_33812)"
                    opacity={gaugePercentage >= 0 ? 1 : 0.3}
                  />
                  <mask id="path-2-inside-2_389_33812" fill="white">
                    <path d="M175.032 8.92951C175.233 3.92843 179.449 0.00959353 184.434 0.465528C203.159 2.17838 221.461 6.948 238.586 14.5768C243.229 16.6455 244.972 22.2421 242.586 26.7311V26.7311C240.251 31.1249 234.831 32.8036 230.276 30.8007C215.528 24.3158 199.811 20.205 183.731 18.6264C178.74 18.1364 174.832 13.9409 175.032 8.92951V8.92951Z" />
                  </mask>
                  <path
                    d="M175.032 8.92951C175.233 3.92843 179.449 0.00959353 184.434 0.465528C203.159 2.17838 221.461 6.948 238.586 14.5768C243.229 16.6455 244.972 22.2421 242.586 26.7311V26.7311C240.251 31.1249 234.831 32.8036 230.276 30.8007C215.528 24.3158 199.811 20.205 183.731 18.6264C178.74 18.1364 174.832 13.9409 175.032 8.92951V8.92951Z"
                    stroke={gaugePercentage > 25 ? "#FCB5C3" : "#4A4A4A"}
                    strokeWidth="28.3966"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    mask="url(#path-2-inside-2_389_33812)"
                    opacity={gaugePercentage > 25 ? 1 : 0.3}
                  />
                  <mask id="path-3-inside-3_389_33812" fill="white">
                    <path d="M250.807 30.9177C253.395 26.6676 258.93 25.258 263.082 28.0005C275.771 36.381 287.242 46.4136 297.181 57.8226C300.552 61.6926 299.747 67.5587 295.638 70.6349V70.6349C291.632 73.6346 285.983 72.85 282.677 69.0916C274.212 59.4648 264.515 50.9512 253.829 43.7625C249.604 40.9202 248.158 35.2668 250.807 30.9177V30.9177Z" />
                  </mask>
                  <path
                    d="M250.807 30.9177C253.395 26.6676 258.93 25.258 263.082 28.0005C275.771 36.381 287.242 46.4136 297.181 57.8226C300.552 61.6926 299.747 67.5587 295.638 70.6349V70.6349C291.632 73.6346 285.983 72.85 282.677 69.0916C274.212 59.4648 264.515 50.9512 253.829 43.7625C249.604 40.9202 248.158 35.2668 250.807 30.9177V30.9177Z"
                    stroke={gaugePercentage > 50 ? "#FFEB3A" : "#4A4A4A"}
                    strokeWidth="28.3966"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    mask="url(#path-3-inside-3_389_33812)"
                    opacity={gaugePercentage > 50 ? 1 : 0.3}
                  />
                  <mask id="path-4-inside-4_389_33812" fill="white">
                    <path d="M301.373 77.9401C305.554 75.1753 311.204 76.2597 313.81 80.5412C328.423 104.546 336.617 131.791 337.631 159.735C337.815 164.833 333.571 168.886 328.471 168.786V168.786C323.366 168.685 319.341 164.459 319.12 159.358C318.076 135.26 311.036 111.775 298.618 90.9638C295.986 86.5538 297.089 80.7727 301.373 77.9401V77.9401Z" />
                  </mask>
                  <path
                    d="M301.373 77.9401C305.554 75.1753 311.204 76.2597 313.81 80.5412C328.423 104.546 336.617 131.791 337.631 159.735C337.815 164.833 333.571 168.886 328.471 168.786V168.786C323.366 168.685 319.341 164.459 319.12 159.358C318.076 135.26 311.036 111.775 298.618 90.9638C295.986 86.5538 297.089 80.7727 301.373 77.9401V77.9401Z"
                    stroke={gaugePercentage > 75 ? "#7FE47E" : "#4A4A4A"}
                    strokeWidth="28.3966"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    mask="url(#path-4-inside-4_389_33812)"
                    opacity={gaugePercentage > 75 ? 1 : 0.3}
                  />
                </svg>

                {/* Score in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                  <span className="text-3xl md:text-4xl font-bold">{effectivenessResult.score}</span>
                </div>
              </div>

              <div className="text-center flex flex-col items-center justify-center">
                <p className="text-sm md:text-base">Your effectiveness is</p>
                <p className={`text-sm md:text-base font-medium ${scoreDesc.color}`}>
                  {scoreDesc.text}
                </p>
              </div>
            </div>

            {/* Right - Details */}
            <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6 border border-border rounded-xl">

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                  <h3 className="text-base md:text-lg font-bold">How this shows up in your week/work</h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {instructions.howItShowsUp}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  <h3 className="text-base md:text-lg font-bold">
                    What breaks first
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {instructions.whatBreaksFirst}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <h3 className="text-base md:text-lg font-bold">
                    What changes this immediately
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {instructions.whatChangesThis}
                </p>
              </div>
              {/* Footer */}
              <div className="flex flex-col items-start gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="helpful"
                    checked={isHelpful}
                    onCheckedChange={(checked) =>
                      setIsHelpful(checked as boolean)
                    }
                  />
                  <label htmlFor="helpful" className="text-xs md:text-sm cursor-pointer">
                    Is this helpful?
                  </label>
                </div>

                <Button
                  onClick={handleSignUpClick}
                  className="rounded-full h-10 md:h-11 w-full text-sm md:text-base"
                >
                  Learn more
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
