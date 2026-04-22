"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { useRouter } from "next/navigation";
import { RouteConfig } from "@/constants/RouteConfig";
import { ScopeTask } from "./components/ScopeTask";
import { Steps } from "./components/Steps";
import { Research } from "./components/Research";

type ExecutionMode = "scope" | "research" | "steps";

export default function GuideStepsPage() {
  const [activeMode, setActiveMode] = useState<ExecutionMode>("scope");
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen text-white h-screen desktop:max-w-[1000px] xl:max-w-[1300px] 1.5xl:max-w-[1500px] mx-auto  mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 ">
        <div>
          <h1 className="text-lg font-semibold">Vantum Assist • Execution</h1>
          <p className="text-sm text-gray-400">Explore/Scope/Research/Steps</p>
        </div>
        <button
          onClick={() => router.push(RouteConfig.MasterKanBan.path)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Workload Section */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">
            Workload vs. capacity
          </h3>
          <span className="text-sm text-gray-400">
            {formatDuration(630)} / {formatDuration(2400)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-8 bg-gray-800 rounded-md overflow-hidden">
          <div
            className="absolute h-full bg-linear-to-r from-teal-500 to-teal-400 transition-all duration-300"
            style={{ width: `${(630 / 2400) * 100}%` }}
          />
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-gray-400">
            Planned: <span className="text-white">{formatDuration(630)}</span>
          </span>
          <span className="text-gray-400">
            Capacity: <span className="text-white">{formatDuration(2400)}</span>
          </span>
          <span className="text-gray-400">
            Completed: <span className="text-white">{formatDuration(60)}</span>
          </span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveMode("scope")}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeMode === "scope"
                ? "bg-white text-black"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            Scope Task
          </button>
          <button
            onClick={() => setActiveMode("research")}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeMode === "research"
                ? "bg-white text-black"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            Research
          </button>
          <button
            onClick={() => setActiveMode("steps")}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeMode === "steps"
                ? "bg-white text-black"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            Steps
          </button>
        </div>
      </div>

      {/* Current Mode Display */}
      <div className="px-6 py-4 ">
        <p className="text-sm text-gray-400">
          Vantum Execution Mode - {activeMode === "scope" && "Scope Document"}
          {activeMode === "research" && "Research"}
          {activeMode === "steps" && "Steps"}
        </p>
      </div>

      {/* Content Area */}
      <div className="px-6 py-4 flex flex-col flex-1 min-h-0">
        {activeMode === "scope" && <ScopeTask />}
        {activeMode === "research" && <Research />}
        {activeMode === "steps" && <Steps />}
      </div>
    </div>
  );
}
