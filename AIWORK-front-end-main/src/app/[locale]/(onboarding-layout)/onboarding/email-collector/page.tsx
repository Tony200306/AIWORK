"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RouteConfig } from "@/constants/RouteConfig";
import { ListTodo, Sparkle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useOnboardingBraindumpStore } from "@/stores/onboardingBraindumpStore";
import { useOnboardingSendInfo } from "@/hooks/shared/onboarding/useOnboardingSendInfo";
import {
  calculateCapacity,
  formatTime,
  getCapacityBarColor,
  getCapacityTextColor,
  getCapacityMessages,
} from "@/utils/capacityCalculations";
import { toast } from "sonner";
import { isEmail } from "@/utils/regexes/isEmail";

export default function EmailCollectorPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const router = useRouter();

  const { data: storeData, removeSelectedTask } = useOnboardingBraindumpStore();
  const { mutate: sendInfo, isPending } = useOnboardingSendInfo();

  // Get tasks from store
  const tasks = storeData.selected_tasks?.map((task) => task.text);

  // Calculate capacity data
  const capacityData = useMemo(() => {
    // Get work_hours from questions (weekly-hours page)
    const workHoursQuestion = storeData.questions.find(
      (q) => q.slug === "weekly-hours"
    );
    const workHours = workHoursQuestion ? parseInt(workHoursQuestion.answer, 10) : 40;

    // Get slider value from questions (task-timeline page)
    const sliderQuestion = storeData.questions.find(
      (q) => q.slug === "task-timeline"
    );

    // Extract numeric value from answer like "85% - Fully engaged"
    let sliderValue = 85; // default
    if (sliderQuestion) {
      const match = sliderQuestion.answer.match(/\d+/);
      if (match) {
        sliderValue = parseInt(match[0], 10);
      }
    }

    return calculateCapacity(storeData.selected_tasks, workHours, sliderValue);
  }, [storeData.selected_tasks, storeData.questions]);

  const capacityMessages = getCapacityMessages(
    capacityData.capacityPercent,
    capacityData.capacityState
  );
  const barColor = getCapacityBarColor(capacityData.capacityState);
  const textColor = getCapacityTextColor(capacityData.capacityState);


  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!isEmail.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    sendInfo(
      {
        name: name.trim(),
        email: email.trim(),
        tasks: tasks,
        tags: receiveUpdates ? ["BrainDump", "onboarding", "newsletter"] : ["BrainDump", "onboarding"],
      },
      {
        onSuccess: () => {
          router.push(RouteConfig.OnboardingCapacityReport.path);
        },
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 items-center px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
      <div className="flex-1 flex flex-col min-h-0 w-full max-w-[870px]">
        {/* Capacity Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4 ${textColor}`}>
            {capacityMessages.headline}
          </h2>
          <div className="relative">
            {/* Background bar */}
            <div className="h-5 sm:h-6 bg-secondary rounded-full w-full relative overflow-hidden">
              {/* Filled bar - capped at 100% width but can represent higher percentages */}
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                style={{
                  width: `${Math.min(capacityData.capacityPercent, 100)}%`,
                }}
              />
            </div>
            {/* Capacity info text */}
            <div className="absolute right-2 sm:right-3 top-0 text-xs sm:text-sm text-zinc-200 h-5 sm:h-6 flex items-center">
              <span className="hidden sm:inline">
                {formatTime(capacityData.targetCapacityHours * 60)} cap •{" "}
                {formatTime(capacityData.plannedMinutes)} planned
              </span>
              <span className="sm:hidden">
                {formatTime(capacityData.targetCapacityHours * 60)} • {formatTime(capacityData.plannedMinutes)}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-center mt-2 text-xs sm:text-sm px-2">
            {capacityMessages.supporting}
          </p>
        </div>
        <div className="rounded-2xl sm:rounded-3xl bg-popover-foreground">
          {/* Main Card */}
          <div className="p-4 sm:p-6 md:p-10 pt-4 sm:pt-6 pb-0 mb-4 sm:mb-5">
            {/* Header */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 sm:mb-4 px-2">
              Get your free Capacity Report
            </h1>
            <p className="text-muted-foreground text-center mb-6 sm:mb-8 md:mb-12 text-sm sm:text-base px-2">
              Get a detailed breakdown of your weekly capacity planning and
              tricks on how you can do better
            </p>

            {/* Form */}
            <div className="space-y-4 sm:space-y-6">
              {/* Name Field */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-sm sm:text-base font-medium sm:w-32 shrink-0">Your Name:</label>
                <Input
                  classWrapper="w-full"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1 bg-background border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-sm sm:text-base font-medium sm:w-32 shrink-0">
                  Your Email:
                </label>
                <Input
                  classWrapper="w-full"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-card border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="mb-4 sm:mb-6" />

            {/* Checkbox */}
            <div className="flex items-start sm:items-center justify-center gap-3 px-2">
              <Checkbox
                id="updates"
                color={barColor}
                checked={receiveUpdates}
                onCheckedChange={(checked) =>
                  setReceiveUpdates(checked as boolean)
                }
                className="border-teal-500 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 mt-1 sm:mt-0"
              />
              <label htmlFor="updates" className="text-sm sm:text-base cursor-pointer">
                Receive updates & email about Vantum
              </label>
            </div>
            <div className="px-2 sm:px-4 md:px-8 flex flex-col items-center mt-4">
              <Button
                onClick={handleSubmit}
                disabled={isPending || !name.trim() || !email.trim()}
                className={`h-[38px] sm:h-[43px] text-sm sm:text-base w-full sm:w-auto ${barColor}`}
              >
                <span className="hidden sm:inline">
                  {isPending ? "Submitting..." : "See your Full Capacity Report"}
                </span>
                <span className="sm:hidden">
                  {isPending ? "Submitting..." : "Get Report"}
                </span>
                <Sparkle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Your Tasks Section - Same style as brain-dump */}
          <div className="rounded-t-2xl sm:rounded-t-3xl p-4 sm:p-6 md:p-8 pt-0 flex-1">
            <div className="flex items-center justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <ListTodo className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              <span className="text-lg sm:text-xl font-medium">Your tasks:</span>
            </div>
            <div className="mb-4 sm:mb-6" />

            {/* Task List */}
            <div className="space-y-2 max-h-[100px] overflow-auto">
              {tasks?.map((task, index) => (
                <div
                  key={index}
                  className="bg-card border-border border rounded-full px-4 sm:px-6 inline-flex items-center mr-2 mb-2"
                  style={{ height: 38, minHeight: 38 }}
                >
                  <span className="text-sm sm:text-base">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
