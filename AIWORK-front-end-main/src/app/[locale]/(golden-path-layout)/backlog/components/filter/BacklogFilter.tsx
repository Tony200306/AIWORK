"use client";

import { useState, useEffect } from "react";
import { Search, Square, SquareCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Priority, TaskStatus, priorityToLabelMapping, statusToLabelMapping } from "@/models/Task";

export type FilterType = "priority" | "category" | "progress" | "commitment" | "sprint";

export interface FilterState {
  priority: Priority[];
  category: string[];
  progress: TaskStatus[];
  commitment: string[];
  sprint: string[];
  searchQuery: string;
}

interface BacklogFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const FILTER_TYPES: { type: FilterType; label: string; comingSoon?: boolean }[] = [
  { type: "priority", label: "Priority" },
  { type: "category", label: "Category", comingSoon: true },
  { type: "progress", label: "Progress" },
  { type: "commitment", label: "Commitment", comingSoon: true },
  { type: "sprint", label: "Sprint", comingSoon: true },
];

const PRIORITY_OPTIONS: Priority[] = [Priority.Highest, Priority.High, Priority.Medium, Priority.Low, Priority.Lowest];
const PROGRESS_OPTIONS: TaskStatus[] = [TaskStatus.TODO, TaskStatus.DOING, TaskStatus.DONE];

export default function BacklogFilter({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}: BacklogFilterProps) {

  const [activeFilter, setActiveFilter] = useState<FilterType>("priority");
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");

  const [selectedPriority, setSelectedPriority] = useState<Priority[]>(
    initialFilters?.priority || []
  );
  const [selectedProgress, setSelectedProgress] = useState<TaskStatus[]>(
    initialFilters?.progress || []
  );

  // Sync state with initialFilters when it changes (e.g., when reopening the filter)
  useEffect(() => {
    if (initialFilters) {
      setSearchQuery(initialFilters.searchQuery || "");
      setSelectedPriority(initialFilters.priority || []);
      setSelectedProgress(initialFilters.progress || []);
    }
  }, [initialFilters]);

  if (!isOpen) return null;

  const handleToggleOption = <T extends string>(
    value: T,
    selected: T[],
    setSelected: (values: T[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected?.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleSelectAllEnum = <T extends string>(
    options: T[],
    selected: T[],
    setSelected: (values: T[]) => void
  ) => {
    if (selected.length === options.length) {
      setSelected([]);
    } else {
      setSelected([...options]);
    }
  };

  const handleClear = () => {
    setSelectedPriority([]);
    setSelectedProgress([]);
    setSearchQuery("");
  };

  const handleApply = () => {
    onApply({
      priority: [...selectedPriority],
      category: [],
      progress: [...selectedProgress],
      commitment: [],
      sprint: [],
      searchQuery,
    });
    onClose();
  };

  const isComingSoon = FILTER_TYPES.find((f) => f.type === activeFilter)?.comingSoon;

  const renderFilterContent = () => {
    if (isComingSoon) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-lg font-medium text-white">Coming Soon</p>
          <p className="text-sm text-muted-foreground mt-2">
            This filter will be available in a future update.
          </p>
        </div>
      );
    }

    switch (activeFilter) {
      case "priority":
        return (
          <PriorityFilterContent
            selected={selectedPriority}
            searchQuery={searchQuery}
            onToggle={(value) =>
              handleToggleOption(value, selectedPriority, setSelectedPriority)
            }
            onSelectAll={() =>
              handleSelectAllEnum(PRIORITY_OPTIONS, selectedPriority, setSelectedPriority)
            }
          />
        );

      case "progress":
        return (
          <ProgressFilterContent
            selected={selectedProgress}
            searchQuery={searchQuery}
            onToggle={(value) =>
              handleToggleOption(value, selectedProgress, setSelectedProgress)
            }
            onSelectAll={() =>
              handleSelectAllEnum(PROGRESS_OPTIONS, selectedProgress, setSelectedProgress)
            }
          />
        );

      default:
        return null;
    }
  };

  const handleReset = () => {
    switch (activeFilter) {
      case "priority":
        setSelectedPriority([]);
        break;
      case "progress":
        setSelectedProgress([]);
        break;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[600px] bg-[#1E1E1E] rounded-xl overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel - Filter Types */}
        <div className="w-1/3 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-white font-semibold text-lg">Filters</h2>
          </div>
          <div className="flex-1 p-2 space-y-1">
            {FILTER_TYPES?.map((filter) => (
              <button
                key={filter.type}
                onClick={() => setActiveFilter(filter.type)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg transition-colors cursor-pointer",
                  activeFilter === filter.type
                    ? "bg-white text-chart-3 font-medium border-l-4 border-l-chart-3"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Filter Content */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search filter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2a2a2a] border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex-1 overflow-auto p-4">
            {renderFilterContent()}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                className="rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                Reset
              </Button>
            </div>
            <Button
              onClick={handleApply}
              className="rounded-lg bg-white text-black hover:bg-gray-200 px-6"
            >
              Done
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-components for each filter type

function PriorityFilterContent({
  selected,
  searchQuery,
  onToggle,
  onSelectAll,
}: {
  selected: Priority[];
  searchQuery: string;
  onToggle: (value: Priority) => void;
  onSelectAll: () => void;
}) {
  const allSelected = selected.length === PRIORITY_OPTIONS.length;

  const filteredOptions = PRIORITY_OPTIONS?.filter((priority) => {
    if (!searchQuery.trim()) return true;
    const label = priorityToLabelMapping()[priority];
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Priority filter</h3>
        <button
          onClick={onSelectAll}
          className="text-sm text-gray-400 hover:text-white cursor-pointer"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filteredOptions?.map((priority) => {
          const label = priorityToLabelMapping()[priority];
          const isChecked = selected.includes(priority);
          return (
            <button
              key={priority}
              type="button"
              onClick={() => onToggle(priority)}
              className="inline-flex items-center gap-3 py-3 cursor-pointer text-white hover:text-gray-300 w-fit"
            >
              {isChecked ? (
                <SquareCheckBig className="w-5 h-5 shrink-0" />
              ) : (
                <Square className="w-5 h-5 shrink-0" />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProgressFilterContent({
  selected,
  searchQuery,
  onToggle,
  onSelectAll,
}: {
  selected: TaskStatus[];
  searchQuery: string;
  onToggle: (value: TaskStatus) => void;
  onSelectAll: () => void;
}) {
  const allSelected = selected.length === PROGRESS_OPTIONS.length;

  const filteredOptions = PROGRESS_OPTIONS?.filter((status) => {
    if (!searchQuery.trim()) return true;
    const label = statusToLabelMapping()[status];
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Progress filter</h3>
        <button
          onClick={onSelectAll}
          className="text-sm text-gray-400 hover:text-white cursor-pointer"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filteredOptions?.map((status) => {
          const label = statusToLabelMapping()[status];
          const isChecked = selected.includes(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => onToggle(status)}
              className="inline-flex items-center gap-3 py-3 cursor-pointer text-white hover:text-gray-300 w-fit"
            >
              {isChecked ? (
                <SquareCheckBig className="w-5 h-5 shrink-0" />
              ) : (
                <Square className="w-5 h-5 shrink-0" />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
