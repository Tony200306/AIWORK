"use client";

import { useNextCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewList,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  TimeAxis,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createResizePlugin } from "@schedule-x/resize";
import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";
import { useEffect, useState } from "react";
import "./style/style.css";
import { Block, BlockStatus } from "@/models/Block";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkLoadAndCapacity } from "@/app/[locale]/(golden-path-layout)/master-kanban/components/kanban-progress/WorkLoadAndCapacity";

// Fake data cho blocks
const mockBlocks: Block[] = [
  {
    id: "1",
    userId: "user-1",
    date: "2026-01-08",
    startAt: "09:00",
    endAt: "11:00",
    durationMinutes: 120,
    status: BlockStatus.Scheduled,
    title: "Client A Class",
    description: "Weekly meeting with client A",
    color: "#854D0E",
    createdAt: "2026-01-08T00:00:00Z",
    updatedAt: "2026-01-08T00:00:00Z",
  },
  {
    id: "2",
    userId: "user-1",
    date: "2026-01-08",
    startAt: "13:00",
    endAt: "14:30",
    durationMinutes: 90,
    status: BlockStatus.InProgress,
    title: "Development Work",
    description: "Frontend implementation",
    color: "#047857",
    createdAt: "2026-01-08T00:00:00Z",
    updatedAt: "2026-01-08T00:00:00Z",
  },
  {
    id: "3",
    userId: "user-1",
    date: "2026-01-08",
    startAt: "15:00",
    endAt: "16:00",
    durationMinutes: 60,
    status: BlockStatus.Completed,
    title: "Team Standup",
    description: "Daily standup meeting",
    color: "#1E40AF",
    createdAt: "2026-01-08T00:00:00Z",
    updatedAt: "2026-01-08T00:00:00Z",
  },
  {
    id: "4",
    userId: "user-1",
    date: "2026-01-08",
    startAt: "16:30",
    endAt: "18:00",
    durationMinutes: 90,
    status: BlockStatus.Scheduled,
    title: "Code Review",
    description: "Review pull requests",
    color: "#7C3AED",
    createdAt: "2026-01-08T00:00:00Z",
    updatedAt: "2026-01-08T00:00:00Z",
  },
  {
    id: "5",
    userId: "user-1",
    date: "2026-01-08",
    durationMinutes: 90,
    status: BlockStatus.Scheduled,
    title: "Code Review",
    description: "Review pull requests",
    color: "#7C3AED",
    createdAt: "2026-01-08T00:00:00Z",
    updatedAt: "2026-01-08T00:00:00Z",
  },
];

function CalendarApp() {
  const eventsService = useState(() => createEventsServicePlugin())[0];
  const dragAndDrop = useState(() => createDragAndDropPlugin())[0];
  const resize = useState(() => createResizePlugin())[0];
  const [selectedDate, setSelectedDate] = useState("2026-01-08");

  const calendar = useNextCalendarApp({
    theme: "shadcn",
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
      createViewList(),
    ],
    events: mockBlocks?.map((block) => {
      if (!block.startAt || !block.endAt) {
        // All-day event
        return {
          id: block.id,
          title: block.title || "Untitled",
          start: Temporal.PlainDate.from(block.date),
          end: Temporal.PlainDate.from(block.date),
        };
      }

      // Timed event
      return {
        id: block.id,
        title: block.title || "Untitled",
        start: Temporal.PlainDateTime.from(
          `${block.date}T${block.startAt}:00`
        ).toZonedDateTime("Asia/Ho_Chi_Minh"),
        end: Temporal.PlainDateTime.from(
          `${block.date}T${block.endAt}:00`
        ).toZonedDateTime("Asia/Ho_Chi_Minh"),
      };
    }),
    plugins: [eventsService, dragAndDrop, resize],
    callbacks: {
      onRender: () => {
        eventsService.getAll();
      },
      onEventUpdate: (updatedEvent) => {
        console.log("Event updated:", updatedEvent);
      },
    },
  });

  const getStatusIcon = (status: BlockStatus) => {
    switch (status) {
      case BlockStatus.Completed:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case BlockStatus.InProgress:
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const todayBlocks = mockBlocks?.filter((block) => block.date === selectedDate);

  return (
    <div className="flex gap-4 p-4 h-screen overflow-hidden">
      {/* Calendar Section */}
      <div className="flex-1 flex flex-col">
        {/* Header Section */}
        <div className="mb-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-semibold text-white">
                Sprint Week 1{" "}
                <span className="text-sm text-gray-400 ml-2">
                  Goal: Ship Q4 onboarding
                </span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Moved tasks to Backlog.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtered
            </Button>
          </div>

          {/* WorkLoad and Capacity */}
          <WorkLoadAndCapacity />
        </div>

        {/* Calendar */}
        <div className="flex-1 flex flex-col ">
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      </div>
    </div>
  );
}

export default CalendarApp;
