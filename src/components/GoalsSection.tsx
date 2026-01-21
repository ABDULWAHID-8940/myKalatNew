"use client";
import React, { useMemo, useState } from "react";
import OriginSlider from "./originSlider";
import type { IGoal } from "@/types/api";
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from "@/hooks/useGoals";

interface GoalsSectionProps {
  businessId: string;
}

function GoalsSection({ businessId }: GoalsSectionProps) {
  const { data, isLoading } = useGoals(businessId);
  const goals = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const goalsWithId = useMemo(
    () => goals.filter((g): g is IGoal & { _id: string } => !!g._id),
    [goals],
  );

  const [newGoal, setNewGoal] = useState({
    targetValue: 0,
    unit: "birr",
    startDate: "",
    estimatedEndDate: "",
  });
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);

  const createGoalMutation = useCreateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const updateGoalMutation = useUpdateGoal();

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;
    createGoalMutation.mutate(
      {
        businessId,
        targetValue: Number(newGoal.targetValue),
        unit: newGoal.unit,
        startDate: new Date().toISOString(),
        estimatedEndDate: newGoal.estimatedEndDate,
      },
      {
        onSuccess: () => {
          setNewGoal({
            targetValue: 0,
            unit: "birr",
            startDate: "",
            estimatedEndDate: "",
          });
        },
      },
    );
  }

  async function deleteGoal(goalId: string) {
    if (!confirm("Delete this goal?")) return;
    deleteGoalMutation.mutate({ goalId, businessId });
  }

  async function updateGoal(goalId: string, updates: Partial<IGoal>) {
    updateGoalMutation.mutate({ goalId, businessId, ...updates });
  }

  const startEditing = (goal: IGoal & { _id: string }) => {
    setEditingGoalId(goal._id);
    setTempProgress(Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  const saveProgress = (goalId: string) => {
    const goal = goalsWithId.find((g) => g._id === goalId);
    if (goal) {
      const newCurrentValue = Math.round(
        (tempProgress / 100) * goal.targetValue,
      );
      updateGoal(goalId, { currentValue: newCurrentValue });
    }
    setEditingGoalId(null);
  };

  const calculatePace = (goal: any) => {
    // const now = new Date();
    // const totalDuration = goal.estimatedEndDate.getTime() - goal.startDate.getTime();
    // let elapsed = now.getTime() - goal.startDate.getTime();

    // If goal hasn't started yet (start date in future)
    // if (elapsed < -86400000) return { status: "not started", pace: 0 }; // 24 hours grace

    // // If goal just started (within 24 hours), consider it started
    // if (elapsed < 0) elapsed = 0;

    // const expectedProgress = (elapsed / totalDuration) * 100;
    const actualProgress = (goal.currentValue / goal.targetValue) * 100;
    // const paceDiff = actualProgress - expectedProgress;

    let status: "ahead" | "on track" | "behind" = "on track";
    // if (paceDiff > 5) status = "ahead";
    // if (paceDiff < -5) status = "behind";

    // return { status, pace: Math.round(paceDiff) };
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setTempProgress(0);
  };

  return (
    <div className="mb-6 md:mb-8">
      <h3 className="text-lg font-semibold mb-3">Goals</h3>
      {isLoading ? (
        <div>Loading goals...</div>
      ) : (
        <div className="space-y-3">
          {goals.length === 0 && (
            <div className="text-sm text-muted-foreground">No goals yet.</div>
          )}
          {goalsWithId.map((g) => (
            <div
              key={g._id}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div className="flex-1">
                <div className="font-medium">
                  Target: {g.targetValue} {g.unit}
                </div>
                {editingGoalId === g._id ? (
                  <div className="mt-2">
                    <div className="text-sm text-gray-500 mb-2">
                      Adjust Progress: {tempProgress}%
                    </div>
                    <OriginSlider
                      value={[tempProgress]}
                      max={100}
                      onValueChange={(value) => setTempProgress(value[0])}
                      showTicks={false}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveProgress(g._id)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Progress: {Math.round(g.currentValue)} / {g.targetValue} (
                    {Math.round((g.currentValue / g.targetValue || 0) * 100)}%)
                    {/* <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                      calculatePace(g).status === 'ahead' ? 'bg-green-100 text-green-800' :
                      calculatePace(g).status === 'behind' ? 'bg-red-100 text-red-800' :
                      calculatePace(g).status === 'not started' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {calculatePace(g).status}
                      {calculatePace(g).pace !== 0 && ` (${calculatePace(g).pace > 0 ? '+' : ''}${calculatePace(g).pace}%)`}
                    </span> */}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {editingGoalId !== g._id && (
                  <>
                    <button
                      onClick={() =>
                        updateGoal(g._id, {
                          currentValue: Math.min(
                            g.targetValue,
                            Math.round(g.currentValue + g.targetValue * 0.05),
                          ),
                        })
                      }
                      className="px-2 py-1 bg-primary text-white rounded text-sm"
                    >
                      +5%
                    </button>
                    <button
                      onClick={() => startEditing(g)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteGoal(g._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={createGoal} className="mt-4 grid grid-cols-1 gap-2">
        <div className="flex gap-2">
          <input
            type="number"
            className="w-32 px-2 py-1 border rounded"
            value={newGoal.targetValue}
            onChange={(e) =>
              setNewGoal({
                ...newGoal,
                targetValue: Number(e.target.value),
              })
            }
            placeholder="Target"
          />
          <select
            value={newGoal.unit}
            onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
            className="px-2 py-1 border rounded"
          >
            <option value="birr">birr</option>
            <option value="customers">customers</option>
            <option value="sales">sales</option>
            <option value="tickets">tickets</option>
            <option value="audience">audience</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            className="px-2 py-1 border rounded"
            value={newGoal.estimatedEndDate}
            onChange={(e) =>
              setNewGoal({ ...newGoal, estimatedEndDate: e.target.value })
            }
            placeholder="End Date"
          />
          <button
            className="px-3 py-1 bg-primary text-white rounded"
            type="submit"
            disabled={createGoalMutation.isPending}
          >
            Create Goal
          </button>
        </div>
      </form>
    </div>
  );
}

export default GoalsSection;
