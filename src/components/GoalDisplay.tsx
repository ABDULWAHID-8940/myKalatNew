"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import type { IGoal } from "@/types/api";
import { useGoals } from "@/hooks/useGoals";

type PaceStatus = "ahead" | "on track" | "behind" | "not started";

interface GoalDisplayProps {
  businessId?: string;
  goals?: IGoal[];
}

function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function computePace(goal: IGoal): {
  status: PaceStatus;
  expectedPercent: number;
  actualPercent: number;
} {
  const now = new Date();
  const start = toDate(goal.startDate);
  const end = toDate(goal.estimatedEndDate);

  // Guard: invalid dates or zero/negative target
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    goal.targetValue <= 0
  ) {
    return { status: "not started", expectedPercent: 0, actualPercent: 0 };
  }

  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const actualPercent = clamp((goal.currentValue / goal.targetValue) * 100);

  // Not started: start date is in the future (allow tiny clock skews)
  if (elapsed < -60_000) {
    return { status: "not started", expectedPercent: 0, actualPercent };
  }

  // Handle zero or negative duration
  if (totalDuration <= 0) {
    // Treat as immediate goal window; compare actual vs 100%
    const diff = actualPercent - 100;
    const status: PaceStatus =
      diff > 5 ? "ahead" : diff < -5 ? "behind" : "on track";
    return { status, expectedPercent: 100, actualPercent };
  }

  // Expected progress based on time elapsed in the window
  const expectedRaw =
    (Math.max(0, Math.min(elapsed, totalDuration)) / totalDuration) * 100;
  const expectedPercent = clamp(expectedRaw);

  // Determine status with a small tolerance to avoid flapping
  const paceDiff = actualPercent - expectedPercent;
  const status: PaceStatus =
    paceDiff > 5 ? "ahead" : paceDiff < -5 ? "behind" : "on track";

  return { status, expectedPercent, actualPercent };
}

export function GoalDisplay({
  businessId,
  goals: goalsProp,
}: GoalDisplayProps) {
  const shouldFetch = !goalsProp && !!businessId;
  const { data, isLoading, error } = useGoals(businessId, {
    enabled: shouldFetch,
  });
  const goals = (goalsProp || (Array.isArray(data) ? data : [])) as IGoal[];

  const content = useMemo(() => {
    if (isLoading)
      return (
        <div className="text-sm text-muted-foreground">Loading goals...</div>
      );
    if (error)
      return (
        <div className="text-sm text-red-600">
          {(error as any)?.message || "Failed to load goals"}
        </div>
      );
    if (!goals.length)
      return (
        <div className="text-sm text-muted-foreground">No goals set yet.</div>
      );

    return (
      <div className="space-y-4">
        {goals.map((g) => {
          const { status, expectedPercent, actualPercent } = computePace(g);
          const isCompleted = g.isCompleted || actualPercent >= 100;

          return (
            <div
              key={
                g._id ||
                `${g.businessId}-${String(g.startDate)}-${String(
                  g.estimatedEndDate,
                )}`
              }
              className="p-4 border rounded-lg bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-900">
                  Target: {g.targetValue.toLocaleString()} {g.unit}
                </div>
                {isCompleted && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Completed
                  </span>
                )}
              </div>

              <Progress value={actualPercent} className="mb-2" />

              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <div>
                  Progress: {Math.round(g.currentValue).toLocaleString()} /{" "}
                  {g.targetValue.toLocaleString()} ({Math.round(actualPercent)}
                  %)
                </div>
                <div>Expected: {Math.round(expectedPercent)}%</div>
              </div>

              <div className="text-xs">
                You are{" "}
                <span
                  className={`font-medium ${
                    status === "ahead"
                      ? "text-emerald-600"
                      : status === "behind"
                        ? "text-red-600"
                        : status === "not started"
                          ? "text-gray-600"
                          : "text-blue-600"
                  }`}
                >
                  {status}
                </span>{" "}
                of your goal pace.
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Started: {toDate(g.startDate).toLocaleDateString()} • Target:{" "}
                {toDate(g.estimatedEndDate).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [goals, isLoading, error]);

  return <div>{content}</div>;
}

export default GoalDisplay;
