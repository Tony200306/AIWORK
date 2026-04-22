"use client";

import { Loading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouteConfig } from "@/constants/RouteConfig";
import { usePostNewTask } from "@/hooks/shared/onboarding/usePostNewTask";
import { usePostTheContextToBrainDump } from "@/hooks/shared/onboarding/usePostTheContextToBrainDump";
import { useSelectGeneratedTask } from "@/hooks/shared/onboarding/useSelectGeneratedTask";
import { useStepTracking } from "@/hooks/useStepTracking";
import { Task, useListSuggestionTaskStore } from "@/stores/listSuggestionTaskStore";
import { useOnboardingBraindumpStore } from "@/stores/onboardingBraindumpStore";
import { AlertCircle, ArrowUp, Check, ListTodo, Sparkle, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BuildingProfileProgress } from "@/components/shared/BuildingProfileProgress";
export default function BrainDumpPage() {
  const [inputValue, setInputValue] = useState("");
  const [showMinTaskError, setShowMinTaskError] = useState(false);
  const [showBuildingProgress, setShowBuildingProgress] = useState<boolean>(false);
  const taskListRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { trackBrainDumpStarted, trackTaskChipClicked, trackTaskAddedToLoad, trackBrainDumpCompleted } = useStepTracking();

  const { data: storeData, setQuery, addSelectedTask, removeSelectedTask ,setSessionId, _hasHydrated} = useOnboardingBraindumpStore();
  const { data: suggestionData, setTasks: setSuggestionTasks,

    setAllTasksLoadingState,
    removeTaskById, replaceTaskById ,setIsLoadingForTask } = useListSuggestionTaskStore();
  const { mutate: postContext, isPending: isPostPending } = usePostTheContextToBrainDump();
  const { mutateAsync: selectGeneratedTask , isPending: isSelectPending } = useSelectGeneratedTask();
  const { mutateAsync: postNewTask, isPending: isPostNewTaskPending } = usePostNewTask();


  // Use selected_tasks from store instead of local state
  const addedTasks = storeData.selected_tasks;
  const manualTaskCount = addedTasks?.filter(task => task.task_source === "manual").length;



  // Track Brain Dump Started on mount
  useEffect(() => {
    trackBrainDumpStarted({
      initial_task_count: addedTasks.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when tasks are added
  useEffect(() => {
    if (taskListRef.current) {
      taskListRef.current.scrollTop = taskListRef.current.scrollHeight;
    }
  }, [addedTasks]);

  // Hide error when user adds enough tasks
  useEffect(() => {
    if (addedTasks.length >= 5) {
      setShowMinTaskError(false);
    }
  }, [addedTasks.length]);


  useEffect(() => {
    setAllTasksLoadingState(false);
  }, []);

  // Determine if we should show the building profile progress (first time only)
  useEffect(() => {
    // Wait for store hydration
    if (!_hasHydrated) return;

    // Check if we've already determined this
    const hasDetermined = sessionStorage.getItem("onboarding_building_progress_determined");
    if (hasDetermined) return;

    // Must have a valid session
    if (!storeData.session_id) return;

    // Check sessionStorage flag to see if we've already shown the progress
    const hasSeenProgress = sessionStorage.getItem("onboarding_seen_building_progress");

    // Show progress if this is the first time (no flag in sessionStorage)
    const isFirstTime = !hasSeenProgress;
    setShowBuildingProgress(isFirstTime);

    // Mark that we've determined this
    sessionStorage.setItem("onboarding_building_progress_determined", "true");
  }, [_hasHydrated, storeData.session_id]);

  const handleProgressComplete = () => {
    // Mark that we've shown the progress screen
    sessionStorage.setItem("onboarding_seen_building_progress", "true");
    router.push(RouteConfig.LoginPage.path);
  };



  // Redirect to first onboarding page if session_id doesn't exist
  useEffect(() => {
    // Wait for store to hydrate from sessionStorage
    if (!_hasHydrated) return;

    if (storeData.session_id === null) {
      router.push(RouteConfig.YourNamePage.path);
    }
  }, [storeData.session_id, _hasHydrated, router]);

  // Fetch more suggestions when only 6 remaining
  useEffect(() => {
    // Only proceed if session_id exists
    if (!storeData.session_id) return;
    if (suggestionData.tasks.length < 6 || suggestionData === null) {
      postContext(
        {
          session_id: storeData.session_id,
          selected_tasks: storeData.selected_tasks?.map((task) => task.id),
          questions: storeData.questions,
          query:""
        },
        {
          onSuccess: (response) => {
            if (response?.tasks) {
              setSuggestionTasks(response.tasks);
            }
          },
          onError: () => {
            // Silently fail
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestionData.tasks.length, storeData.session_id]);

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      const taskText = inputValue.trim();

      try {
        // Call postNewTask API
        const response = await postNewTask({
          query: taskText,
        });
        console.log("Post New Task Response:", response);

        if (response ) {
          // Get the first task from response
          const newTask = response;

          // Increment manual task count in cache
          const newManualCount = manualTaskCount + 1;

          trackTaskAddedToLoad({
            task_source: "manual",
            task_title: newTask.title,
            task_est_time: newTask.est_time,
            session_manual_task_count: newManualCount,
            cumulative_task_count: addedTasks.length + 1,
          });

          // Add task to selected_tasks in store
          addSelectedTask({
            id: newTask.id,
            text: newTask.title,
            task_source: "manual",
            est_time: newTask.est_time,
            kind: "manual",
            parent_id: "",
            relation_type: "",
          });
        }

        setInputValue("");
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    }
  };

  const handleSuggestionClick = async (suggestion: Task) => {
    const index = suggestionData.tasks.findIndex(task => task.id === suggestion.id);
    setIsLoadingForTask(index, true);

    // Track task chip clicked event
    trackTaskChipClicked({
      id: suggestion.id,
      task_title: suggestion.text,
      task_est_time: suggestion.est_time,
      task_source: "chip",
      tray_version: null,
      kind: suggestion.kind,
      parent_id: suggestion.parent_id,
      relation_type: suggestion.relation_type
    });

    // Track task added to load (chip-generated task)
    trackTaskAddedToLoad({
      task_source: "chip",
      task_title: suggestion.text,
      task_est_time: suggestion.est_time,
      cumulative_task_count: addedTasks.length + 1,
      session_manual_task_count: manualTaskCount,
    });

    try {
      // Await the mutation - each call gets its own Promise
      const response = await selectGeneratedTask({
        session_id: storeData.session_id,
        selected_task_id: suggestion.id,
      });
      if (response?.tasks && response.tasks.length > 0) {
        replaceTaskById(suggestion.id, response.tasks);
        // Add to onboarding store's selected_tasks
        addSelectedTask({
          id: suggestion.id,
          text: suggestion.text,
          est_time: suggestion.est_time,
          task_source: "chip",
          kind: suggestion.kind,
          parent_id: suggestion.parent_id,
          relation_type: suggestion.relation_type,
        });
      } else {
        removeTaskById(suggestion.id);
      }
    } catch (error) {
      console.error("Failed to select task:", error);
      removeTaskById(suggestion.id);
    }
  };

  const handleRemoveTask = (id: string) => {
    const taskToRemove = addedTasks.find(task => task.id === id);
    if (taskToRemove) {
      removeSelectedTask(taskToRemove.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSeeReport = () => {
    // Check if user has added at least 5 tasks
    if (addedTasks.length < 5) {
      console.log("User must add at least 5 tasks");
      setShowMinTaskError(true);
      return;
    }

    // Save query to store (join all tasks as query)
    const query = addedTasks?.map(task => task.text).join(", ");
    setQuery(query);

    // Calculate task counts
    const chipTaskCount = addedTasks?.filter(task => task.task_source === "chip").length;
    const manualTaskCountValue = addedTasks?.filter(task => task.task_source === "manual").length;
    const totalTasks = addedTasks.length;

    // Track brain dump completed
    trackBrainDumpCompleted({
      total_tasks: totalTasks,
      manual_task_count: manualTaskCountValue,
      chip_task_count: chipTaskCount,
    });
    router.push(RouteConfig.OnboardingEmailCollector.path);
  };

  // Show building profile progress for first-time users
  if (showBuildingProgress === true) {
    return (
      <BuildingProfileProgress
        onComplete={handleProgressComplete}
        duration={5000}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 items-center ">
      {" "}
      <div className="flex-1 flex flex-col min-h-0 w-full md:w-[870px] px-4 md:px-0">
        {/* Header */}
        <h1 className="text-[34px] md:text-5xl text-primary font-bold text-center  bg-gradient-to-r bg-clip-text ">
          Brain Dump
        </h1>
        <p className="mt-0 md:mt-2 text-center text-sm md:text-base text-white md:text-muted-foreground mb-4 md:mb-8">
         Tell us everything you need to get done...
        </p>

        {/* Main Card */}
        <div className="md:bg-popover-foreground md:rounded-3xl p-2 md:p-10">
          {/* Input */}
          <div className="flex items-center gap-2 md:gap-4 mb-4">
            <div className="relative w-full">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type in all your ideas..."
                className="flex-1 bg-card border border-border rounded-full px-4 pt-3 pb-12 h-[90px] md:h-auto md:px-6 md:py-4 text-sm md:text-base focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50 align-top"
                classWrapper="w-full"
                style={{ lineHeight: '1.5' }}
              />
              <div className="absolute right-2 bottom-2 md:top-1/2 md:-translate-y-1/2 md:bottom-auto">
                <Button
                  disabled={isPostNewTaskPending}
                  onClick={handleSubmit}
                  className={`w-7! h-7! md:w-8! md:h-8! rounded-full md:rounded-lg transition-colors ${
                    inputValue.trim()
                      ? 'bg-white hover:bg-white/90 text-black'
                      : 'bg-[#71717A] hover:bg-[#71717A]/90'
                  }`}
                >
                  <ArrowUp className="w-5 h-5 md:w-6 md:h-6 md:hidden" />
                  <Check className="hidden md:block w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <p className="font-medium mb-4 mt-8 md:mt-0 text-sm md:text-base">You might also be thinking about...</p>
          <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:gap-4">
            {suggestionData.tasks?.map((task) => {
              const isLoading = task.isLoading ?? false;

              return (
                <button
                  key={task.id}
                  onClick={() => handleSuggestionClick(task)}
                  disabled={isLoading}
                  className="text-card-foreground md:bg-input hover:bg-card/80 border border-border rounded-lg md:rounded-2xl py-1 px-3 text-[13px] md:p-6 text-left md:text-center md:text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loading classWrapper="h-[24px]!" />
                    </div>
                  ) : (
                    task.text
                  )}
                </button>
              );
            })}
            {suggestionData.tasks.length === 0 && (<div className="col-span-3 flex justify-center">
              <Loading classWrapper="h-[100px]!" />
            </div>
            )}
          </div>
        </div>

        {/* Button - desktop version */}
        <div className="hidden md:flex px-8 flex-col items-center mt-2 mb-2">
          {showMinTaskError && (
            <div className="flex items-center gap-2 text-destructive text-sm mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>You have to add at least 5 tasks</span>
            </div>
          )}
          <Button
            onClick={handleSeeReport}
            disabled={isPostPending}
            className={`h-[43px] text-base w-auto transition-opacity ${addedTasks.length < 5 ? 'opacity-50' : 'opacity-100'}`}
          >
            {isPostPending ? "Processing..." : "See your Full Capacity Report"}{" "}
            <Sparkle />
          </Button>
        </div>

        {/* Added Tasks Section */}
        <div className="mt-9 md:mt-0 mb-1 min-h-[210px] md:bg-popover-foreground rounded-3xl md:p-4 xl:p-8 md:px-8  flex flex-col  pb-0">
          <div className="flex items-center justify-start gap-2 md:gap-3 mb-4">
            <ListTodo color="orange" className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            <div className="flex flex-1 items-center gap-1 justify-between md:justify-start">
            <span className="text-sm md:text-xl font-medium">Added tasks </span>
                      <span className="text-sm md:text-xl font-medium">({addedTasks.length}) </span>
         </div> 
         </div>
          <div className="border-b  border-white mb-4" />

          {/* Task List */}
          <div
            ref={taskListRef}
            className="space-y-2 px-2 md:space-y-0 md:space-x-2 h-[90px]  md:h-[110px] overflow-auto "
          >
            {addedTasks?.map((task) => (
              <div
                key={task.id}
                className="my-1 min-h-[25px]  md:h-[45px] md:bg-card md:border md:border-border md:rounded-full px-0 md:px-6 flex md:inline-flex items-start md:items-center justify-between w-full md:w-auto gap-2"

              >
                {/* Bullet point for mobile only */}
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-foreground mt-1.5 md:hidden"></span>
                <span className="text-[13px] md:text-base flex-1">{task.text}</span>
                <button
                  onClick={() => handleRemoveTask(task.id)}
                  className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-b hidden md:block border-white  mb-2" />

          {/* Button - only show at bottom on mobile */}
          <div className="fixed bottom-6 left-0 right-0 mt-2 flex md:hidden flex-col items-center gap-2">
            {showMinTaskError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>You have to add at least 5 tasks</span>
              </div>
            )}
            <Button
              onClick={handleSeeReport}
              disabled={isPostPending}
              className={`w-[220px] h-[43px] text-sm  transition-opacity ${addedTasks.length < 5 ? 'opacity-50' : 'opacity-100'}`}
            >
              {isPostPending ? "Processing..." : "Get your Capacity Report"}{" "}
              <Sparkles />
            </Button>
          </div>
        </div>
      </div>
     
    </div>
  );
}
