"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Target } from "lucide-react";
import toast from "react-hot-toast";

export interface Goal {
  businessId: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string | Date;
  estimatedEndDate: string | Date;
  createdAt?: string | Date;
  _id?: string;
  isCompleted?: boolean;
}

interface GoalManagementProps {
  businessId: string;
}

type PaceStatus = "ahead" | "on track" | "behind" | "not started";

function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function computePace(goal: Goal): {
  status: PaceStatus;
  expectedPercent: number;
  actualPercent: number;
} {
  const now = new Date();
  const start = toDate(goal.startDate);
  const end = toDate(goal.estimatedEndDate);

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

  if (elapsed < -60_000) {
    return { status: "not started", expectedPercent: 0, actualPercent };
  }

  if (totalDuration <= 0) {
    const diff = actualPercent - 100;
    const status: PaceStatus =
      diff > 5 ? "ahead" : diff < -5 ? "behind" : "on track";
    return { status, expectedPercent: 100, actualPercent };
  }

  const expectedRaw =
    (Math.max(0, Math.min(elapsed, totalDuration)) / totalDuration) * 100;
  const expectedPercent = clamp(expectedRaw);

  const paceDiff = actualPercent - expectedPercent;
  const status: PaceStatus =
    paceDiff > 5 ? "ahead" : paceDiff < -5 ? "behind" : "on track";

  return { status, expectedPercent, actualPercent };
}

export function GoalManagement({ businessId }: GoalManagementProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const PRESET_UNITS = [
    "birr",
    "customers",
    "sales",
    "tickets",
    "audience",
  ] as const;

  // Form state
  const [form, setForm] = useState({
    targetValue: "",
    currentValue: "",
    unit: "birr",
    customUnit: "",
    startDate: "",
    estimatedEndDate: "",
  });

  const resetForm = () => {
    setForm({
      targetValue: "",
      currentValue: "",
      unit: "birr",
      customUnit: "",
      startDate: "",
      estimatedEndDate: "",
    });
  };

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/goal?businessId=${businessId}`);
      if (!res.ok) throw new Error("Failed to fetch goals");
      const data: Goal[] = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [businessId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      toast.error("No business ID available");
      return;
    }

    const targetValue = parseFloat(form.targetValue);
    const currentValue = parseFloat(form.currentValue) || 0;

    if (!targetValue || targetValue <= 0) {
      toast.error("Please enter a valid target value");
      return;
    }

    if (!form.startDate || !form.estimatedEndDate) {
      toast.error("Please select start and end dates");
      return;
    }

    const effectiveUnit =
      form.unit === "custom" ? form.customUnit.trim() : form.unit;
    if (!effectiveUnit) {
      toast.error("Please enter a unit");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        businessId,
        targetValue,
        currentValue,
        unit: effectiveUnit,
        startDate: form.startDate,
        estimatedEndDate: form.estimatedEndDate,
      };

      const res = await fetch(`/api/goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create goal");

      toast.success("Goal created successfully");
      setCreateDialogOpen(false);
      resetForm();
      await loadGoals();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create goal");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal?._id) return;

    const targetValue = parseFloat(form.targetValue);
    const currentValue = parseFloat(form.currentValue) || 0;

    if (!targetValue || targetValue <= 0) {
      toast.error("Please enter a valid target value");
      return;
    }

    if (!form.startDate || !form.estimatedEndDate) {
      toast.error("Please select start and end dates");
      return;
    }

    const effectiveUnit =
      form.unit === "custom" ? form.customUnit.trim() : form.unit;
    if (!effectiveUnit) {
      toast.error("Please enter a unit");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        goalId: editingGoal._id,
        targetValue,
        currentValue,
        unit: effectiveUnit,
        startDate: form.startDate,
        estimatedEndDate: form.estimatedEndDate,
      };

      const res = await fetch(`/api/goal`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update goal");

      toast.success("Goal updated successfully");
      setEditDialogOpen(false);
      setEditingGoal(null);
      resetForm();
      await loadGoals();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update goal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const res = await fetch(`/api/goal`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId }),
      });

      if (!res.ok) throw new Error("Failed to delete goal");

      toast.success("Goal deleted successfully");
      await loadGoals();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete goal");
    }
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      targetValue: goal.targetValue.toString(),
      currentValue: goal.currentValue.toString(),
      unit: PRESET_UNITS.includes(goal.unit as any) ? goal.unit : "custom",
      customUnit: PRESET_UNITS.includes(goal.unit as any) ? "" : goal.unit,
      startDate: toDate(goal.startDate).toISOString().slice(0, 10),
      estimatedEndDate: toDate(goal.estimatedEndDate)
        .toISOString()
        .slice(0, 10),
    });
    setEditDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading goals...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadGoals}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Goal Management</h2>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetValue" className="mb-1">
                    Target Value
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.targetValue}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        targetValue: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit" className="mb-1">
                    Unit
                  </Label>
                  <Select
                    value={form.unit}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, unit: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="birr">Birr</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="tickets">Tickets</SelectItem>
                      <SelectItem value="audience">Audience</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.unit === "custom" && (
                    <div className="mt-2">
                      <Label htmlFor="customUnit" className="mb-1">
                        Custom unit
                      </Label>
                      <Input
                        id="customUnit"
                        placeholder="e.g. signups, downloads, etc."
                        value={form.customUnit}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            customUnit: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="currentValue" className="mb-1">
                  Current Value (Optional)
                </Label>
                <Input
                  id="currentValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.currentValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      currentValue: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="mb-1">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedEndDate" className="mb-1">
                    Target Date
                  </Label>
                  <Input
                    id="estimatedEndDate"
                    type="date"
                    value={form.estimatedEndDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        estimatedEndDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No goals created yet.</p>
            <p className="text-sm text-gray-500 mt-1">
              Create your first goal to start tracking progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const { status, expectedPercent, actualPercent } =
              computePace(goal);
            const isCompleted = goal.isCompleted || actualPercent >= 100;

            return (
              <Card key={goal._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Target: {goal.targetValue.toLocaleString()} {goal.unit}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          Completed
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(goal)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(goal._id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={actualPercent} className="mb-3" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current:</span>{" "}
                      <span className="font-medium">
                        {Math.round(goal.currentValue).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Progress:</span>{" "}
                      <span className="font-medium">
                        {Math.round(actualPercent)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected:</span>{" "}
                      <span className="font-medium">
                        {Math.round(expectedPercent)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>{" "}
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
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-3">
                    Started: {toDate(goal.startDate).toLocaleDateString()} •
                    Target: {toDate(goal.estimatedEndDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-targetValue">Target Value</Label>
                <Input
                  id="edit-targetValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.targetValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      targetValue: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unit</Label>
                <Select
                  value={form.unit}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, unit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="birr">Birr</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="tickets">Tickets</SelectItem>
                    <SelectItem value="audience">Audience</SelectItem>
                  </SelectContent>
                </Select>
                {form.unit === "custom" && (
                  <div className="mt-2">
                    <Label htmlFor="edit-customUnit">Custom unit</Label>
                    <Input
                      id="edit-customUnit"
                      placeholder="e.g. signups, downloads, etc."
                      value={form.customUnit}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          customUnit: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-currentValue">Current Value</Label>
              <Input
                id="edit-currentValue"
                type="number"
                min="0"
                step="0.01"
                value={form.currentValue}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, currentValue: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-estimatedEndDate">Target Date</Label>
                <Input
                  id="edit-estimatedEndDate"
                  type="date"
                  value={form.estimatedEndDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      estimatedEndDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GoalManagement;
