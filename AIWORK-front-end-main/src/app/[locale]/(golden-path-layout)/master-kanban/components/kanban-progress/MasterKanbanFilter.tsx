"use client";

import { useState, useEffect } from "react";
import { Search, Square, SquareCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Priority, priorityToLabelMapping } from "@/models/Task";

export interface KanbanFilterState {
  priority: Priority[];
  searchQuery: string;
}

interface MasterKanbanFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: KanbanFilterState) => void;
  initialFilters?: Partial<KanbanFilterState>;
}

type FilterType = "priority" | "category" | "commitment" | "sprint";

const FILTER_TYPES: { type: FilterType; label: string; comingSoon?: boolean }[] = [
  { type: "priority", label: "Priority" },
  { type: "category", label: "Category", comingSoon: true },
  { type: "commitment", label: "Commitment", comingSoon: true },
  { type: "sprint", label: "Sprint", comingSoon: true },
];

const PRIORITY_OPTIONS: Priority[] = [Priority.Highest, Priority.High, Priority.Medium, Priority.Low, Priority.Lowest];

export default function MasterKanbanFilter({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}: MasterKanbanFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("priority");
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");

  const [selectedPriority, setSelectedPriority] = useState<Priority[]>(
    initialFilters?.priority || []
  );

  useEffect(() => {
    if (initialFilters) {
      setSearchQuery(initialFilters.searchQuery || "");
      setSelectedPriority(initialFilters.priority || []);
    }
  }, [initialFilters]);

  if (!isOpen) return null;

  const handleToggleOption = (value: Priority) => {
    if (selectedPriority.includes(value)) {
      setSelectedPriority(selectedPriority?.filter((v) => v !== value));
    } else {
      setSelectedPriority([...selectedPriority, value]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPriority.length === PRIORITY_OPTIONS.length) {
      setSelectedPriority([]);
    } else {
      setSelectedPriority([...PRIORITY_OPTIONS]);
    }
  };

  const handleClear = () => {
    setSelectedPriority([]);
    setSearchQuery("");
  };

  const handleApply = () => {
    onApply({ priority: [...selectedPriority], searchQuery });
    onClose();
  };

  const isComingSoon = FILTER_TYPES.find((f) => f.type === activeFilter)?.comingSoon;

  const filteredPriorityOptions = PRIORITY_OPTIONS?.filter((priority) => {
    if (!searchQuery.trim()) return true;
    const label = priorityToLabelMapping()[priority];
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
            {isComingSoon ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-lg font-medium text-white">Coming Soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This filter will be available in a future update.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">Priority filter</h3>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-gray-400 hover:text-white cursor-pointer"
                  >
                    {selectedPriority.length === PRIORITY_OPTIONS.length ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {filteredPriorityOptions?.map((priority) => {
                    const label = priorityToLabelMapping()[priority];
                    const isChecked = selectedPriority.includes(priority);
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => handleToggleOption(priority)}
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
            )}
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
                onClick={() => setSelectedPriority([])}
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
