import { Tag } from "@/components/shared/ReactComponent/components/Tag/src/Tag";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCreateStep } from "@/hooks/shared/useCreateStep";
import { useUpdateStep } from "@/hooks/shared/useUpdateStep";
import { useUpdateSteps } from "@/hooks/shared/useUpdateSteps";
import { useDebounce } from "@/hooks/useDebounce";
import { formatTimeFromMinutes } from "@/utils/formatTimeDisplay";
import { getScopeDisplayItems } from "@/utils/scopeDisplay";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  MoreVertical,
  Pencil,
  PenLine,
  Plus,
  RefreshCw,
  Rows3,
  Tag as TagIcon,
  TextAlignStart,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Step, Task } from "../../../../../../models/Task";
import { EditStepTagsModal } from "./EditStepTagsModal";
import { SortableItem } from "./SortableItem";
import { StepEditInput } from "./StepEditInput ";

// Re-export for backward compatibility
export const formatDuration = formatTimeFromMinutes;

type ViewMode = "steps" | "scope";

interface Props {
  steps?: Step[];
  onResplit?: () => void;
  onAddStep?: () => void;
  onStepClick?: (stepId: string) => void;
  task: Task;
  tagsAccordionOpen?: boolean;
  onTagsAccordionChange?: (open: boolean) => void;
  isStreaming?: boolean;
  onHeaderHeightChange?: (height: number) => void;
}

export default function ListStep({
  steps,
  onResplit,
  task,
  tagsAccordionOpen,
  onTagsAccordionChange,
  isStreaming = false,
  onHeaderHeightChange,
}: Props) {
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isSavingSteps, setIsSavingSteps] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("steps");
  const params = useParams();
  const headerRef = useRef<HTMLDivElement>(null);

  // Update header height when ref is attached or window resizes
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current && onHeaderHeightChange) {
        const height = headerRef.current.offsetHeight;
        console.log('[ListStep] Header height:', height);
        onHeaderHeightChange(height);
      }
    };

    updateHeaderHeight();

    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [onHeaderHeightChange]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const toggleEditing = () => {
    setCurrentEditId(null);
    setIsEditing(!isEditing);
    setIsAdding(false);
  };

  const { mutateAsync: createStep, isPending: isCreating } = useCreateStep({
    setIsAdding,
  });
  const { mutateAsync: updateStep, isPending: isUpdatingStep } = useUpdateStep({
    setIsEditing,
    brainDumpId: params.id as string,
  });
  const { mutateAsync: updateSteps, isPending: isUpdatingSteps } =
    useUpdateSteps({
      brainDumpId: params.id as string,
    });

  //TODO : TEMP FOR STATE
  const [items, setItems] = useState(steps || []);

  const debouncedItems = useDebounce(isDragging ? null : items, 1000);

  useEffect(() => {
    if (!task?.id || !debouncedItems?.length) return;

    const hasChanges = JSON.stringify(debouncedItems) !== JSON.stringify(steps);
    console.log("Has changes:", hasChanges, { debouncedItems, steps });
    if (hasChanges) {
      setIsSavingSteps(true);
      updateSteps({
        taskId: task?.id,
        steps: debouncedItems?.map((step, index) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          orderIndex: index + 1,
          userEstMinutes: step.userEstMinutes,
          sysEstMinutes: step.sysEstMinutes,
        })),
      }).finally(() => {
        setIsSavingSteps(false);
      });
    }
  }, [debouncedItems]);

  useEffect(() => {
    if (steps) {
      setItems(steps);
    }
    setIsEditing(false);
    setIsAdding(false);
    setCurrentEditId(null);
  }, [steps]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 3. Hàm xử lý khi thả chuột ra (Quan trọng nhất)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    // Nếu không kéo đè lên thằng nào khác thì thôi
    if (!over || active.id === over.id) return;
    console.log("Drag end:", { active: active.id, over: over?.id }, over);

    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      // Hàm arrayMove của dnd-kit giúp đổi vị trí mảng siêu nhanh
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  console.log("Items after drag:", items);
    console.log(task , "task");

  // Scope view component
  const ScopeView = () => {
    const scope = task?.scope;

    if (!scope) {
      return (
        <div className="p-5 text-center text-muted-foreground">
          No scope information available for this task.
        </div>
      );
    }

    const displayItems = getScopeDisplayItems(scope);

    if (displayItems.length === 0) {
      return (
        <div className="p-5 text-center text-muted-foreground">
          No scope information available for this task.
        </div>
      );
    }

    return (
      <div className="border border-border rounded-2xl p-5 mx-5 my-5 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {displayItems?.map(({ key, title, icon, color, value }) => (
          <div key={key}>
            <h3 className={"text-sm font-semibold text-foreground mb-2 flex items-center gap-2" + ` ${color}`}>
              <span className={color}>{icon}</span>
              {title}
            </h3>
            {value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl h-full flex-1 min-h-0 flex flex-col">
      {/* Header with Tabs */}
      <div ref={headerRef} className="p-8 rounded-t-2xl bg-accent">
        <div className="flex items-center justify-between">
          {/* Left: Title and description */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Breakdown</h2>
            <p className="text-white/70 text-sm">
              Vantum splits your tasks into manageable steps.
            </p>
          </div>

          {/* Right: Tabs and dropdown menu */}
          <div className="hidden md:flex items-center gap-1">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
              className="w-fit"
            >
              <TabsList className="bg-white/10 border border-white/20 rounded-lg p-1 gap-1">
                <TabsTrigger
                  value="steps"
                  className="!text-white/60 hover:!text-white rounded-md !h-7 !w-7 !p-0 !border-0 !shadow-none data-[state=active]:!bg-white data-[state=active]:!text-accent"
                >
                  <Rows3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="scope"
                  className="!text-white/60 hover:!text-white rounded-md !h-7 !w-7 !p-0 !border-0 !shadow-none data-[state=active]:!bg-white data-[state=active]:!text-accent"
                >
                          <TextAlignStart/>

                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="w-6 h-6 flex items-center justify-center">
              {items?.length !== 0 && viewMode === "steps" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="text-white hover:text-white/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={isStreaming}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                    <DropdownMenuItem onClick={toggleEditing} disabled={isStreaming} className="text-foreground focus:bg-accent focus:text-foreground">
                      <Pencil className="h-4 w-4 mr-2" />
                      {isEditing ? "Cancel Edit" : "Edit"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onResplit} disabled={isStreaming} className="text-foreground focus:bg-accent focus:text-foreground">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-split
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs className="flex-1 min-h-0" value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsContent value="steps" className="flex-1 min-h-0 overflow-hidden flex flex-col mt-0">
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Steps List */}
            {items?.length === 0 ? (
              task?.id ? (
                <div className="p-5 text-center text-muted-foreground">
                  No steps yet. Add some steps to break down your task.
                </div>
              ) : (
                <div className="p-5 text-center text-muted-foreground">
                  Select a task
                </div>
              )
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={isStreaming ? undefined : handleDragStart}
                onDragEnd={isStreaming ? undefined : handleDragEnd}
              >
                <SortableContext
                  items={items}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="p-5 space-y-4">
                    {items?.map((step) => (
                      <div key={step.id}>
                        <SortableItem
                          className={`${
                            isEditing ? "border-dashed border-white " : ""
                          }`}
                          key={step.id}
                          id={step.id}
                          isStreaming={isStreaming}
                        >
                          <div className="gap-2 justify-between item-center group flex items-center">
                            {isEditing && currentEditId === step.id ? (
                              <StepEditInput
                                stepName={step.title}
                                duration={step.userEstMinutes || step.sysEstMinutes}
                                onSave={(name, duration) =>
                                  updateStep({
                                    description: name,
                                    title: name,
                                    taskId: task?.id,
                                    stepId: step.id,
                                    orderIndex: step.orderIndex,
                                    userEstMinutes: duration,
                                  })
                                }
                                onCancel={() => {}}
                              />
                            ) : (
                              <>
                                <span className="flex items-center gap-2 text-secondary-foreground text-base">
                                  {step.title}
                                  <PenLine
                                    size={16}
                                    onClick={() => {
                                      if (!isStreaming) {
                                        setCurrentEditId(step.id);
                                      }
                                    }}
                                    className={`${
                                      isEditing
                                        ? "group-hover:block"
                                        : "hidden"
                                    } ${isStreaming ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                                  />
                                </span>
                                <span className="text-muted-foreground text-sm text-center">
                                  {formatDuration(
                                    step.userEstMinutes || step.sysEstMinutes
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </SortableItem>
                      </div>
                    ))}
                    {isAdding && isEditing && (
                      <div
                        className={`${
                          isEditing ? "border-dashed border-white " : ""
                        } gap-2 justify-between item-center group flex items-center px-6 py-4 bg-secondary border border-border rounded-2xl cursor-pointer hover:bg-accent transition-colors`}
                      >
                        <StepEditInput
                          stepName={""}
                          duration={0}
                          onSave={(name, duration) => {
                            createStep({
                              taskId: task?.id,
                              title: name,
                              description: name,
                              orderIndex: 0,
                              userEstMinutes: duration,
                            });
                          }}
                          onCancel={() => {
                            setIsAdding(false);
                          }}
                        />
                      </div>
                    )}

                    {/* Add Step Button */}
                    {isEditing && !isStreaming && (
                      <Button
                        size="lg"
                        onClick={() => {
                          setIsAdding(!isAdding);
                        }}
                        variant="outline"
                        className="px-6 py-4 w-full border-dashed rounded-2xl"
                      >
                        {isAdding ? (
                          <X className="w-5 h-full" />
                        ) : (
                          <Plus className="w-5 h-full" />
                        )}
                        {isAdding ? "Cancel adding" : "Add step"}
                      </Button>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scope" className="flex-1 min-h-0 overflow-hidden flex flex-col mt-0">
          <div className="flex flex-col flex-1 min-h-0 ">
            <ScopeView />
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-2 rounded-b-2xl p-8 py-4 border-border border-l-0 border-r-0 border-r-0 border-b-0 border-t-">
        <Accordion
          disabled={!task}
          type="single"
          collapsible
          value={tagsAccordionOpen ? "item-1" : ""}
          onValueChange={(value) => onTagsAccordionChange?.(value === "item-1")}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger
              className="cursor-pointer p-0 py-4 flex-row-reverse hover:no-underline"
              elemWithIcon={<div className="ml-2">Tags (optional)</div>}
            >
              Helps Vantum estimate time
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                {/* Suggested Tags Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    SUGGESTED TAGS
                  </h3>
                  <Button
                    onClick={() => setIsTagsModalOpen(true)}
                    variant="outline"
                    className="rounded-xl border-2 border-border"
                  >
                    <TagIcon className="w-4 h-4" />
                    Add/ Edit tags
                  </Button>
                  <EditStepTagsModal
                    tagsPop={task?.tags}
                    open={isTagsModalOpen}
                    onOpenChange={setIsTagsModalOpen}
                  />
                </div>

                {/* Tag Buttons */}
                <div className="flex flex-wrap gap-3">
                  {task?.tags?.map((tag) => (
                    <button
                      key={tag.id}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Tag
                        className="text-xs"
                        variant="pill"
                        dotColor={tag.color}
                        bordered={false}
                      >
                        {tag.name}
                      </Tag>
                    </button>
                  ))}
                </div>

                {/* Helper Text */}
                <p className="text-sm text-muted-foreground">
                  If we guessed wrong, tap "Add/ Edit tags" - It takes 2
                  seconds.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
