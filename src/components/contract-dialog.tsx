"use client";

import { useState } from "react";
import { useContracts } from "@/hooks/useContracts";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface SocialMediaAction {
  platform: "instagram" | "tiktok" | "telegram";
  actionType: "post" | "story";
  quantity: number;
}

export function ContractDialog({
  senderId,
  reciverId,
  opened = false,
  onClose,
}: {
  onClose: () => void;
  senderId: string;
  reciverId: string;
  opened: boolean;
}) {
  const { createContract } = useContracts();
  const [price, setPrice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [deadline, setDeadline] = useState<string>("");
  const [actions, setActions] = useState<SocialMediaAction[]>([]);
  const [currentAction, setCurrentAction] = useState<
    Omit<SocialMediaAction, "quantity"> & { quantity: string }
  >({
    platform: "instagram",
    actionType: "post",
    quantity: "1",
  });
  const [error, setError] = useState("");

  const handleAddAction = () => {
    const quantity = parseInt(currentAction.quantity);
    if (isNaN(quantity)) {
      setError("Quantity must be a number");
      return;
    }
    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    setActions([
      ...actions,
      {
        ...currentAction,
        quantity,
      },
    ]);
    setCurrentAction({
      platform: "instagram",
      actionType: "post",
      quantity: "1",
    });
    setError("");
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };
  const handleSubmit = async () => {
    const numericPrice = Number(price);

    if (!numericPrice || numericPrice <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (!deadline) {
      setError("Please enter a deadline");
      return;
    }
    if (actions.length === 0) {
      setError("Please add at least one social media action");
      return;
    }
    setLoading(true);

    try {
      await createContract({
        senderId,
        reciverId,
        price: numericPrice,
        socialMediaActions: actions,
        deadline,
      });
      setPrice("");
      setDeadline("");
      setActions([]);
    } catch (err) {
      setError("Failed to create contract. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={opened} onOpenChange={onClose}>
      <DialogTrigger asChild>{}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label htmlFor="price" className="md:text-right">
              Price ($)
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label htmlFor="deadline" className="md:text-right">
              Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="col-span-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Social Media Actions</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={currentAction.platform}
                onValueChange={(value) =>
                  setCurrentAction({
                    ...currentAction,
                    platform: value as SocialMediaAction["platform"],
                  })
                }
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={currentAction.actionType}
                onValueChange={(value) =>
                  setCurrentAction({
                    ...currentAction,
                    actionType: value as SocialMediaAction["actionType"],
                  })
                }
              >
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={currentAction.quantity}
                onChange={(e) =>
                  setCurrentAction({
                    ...currentAction,
                    quantity: e.target.value,
                  })
                }
                className="w-full sm:w-[80px]"
                min="1"
              />

              <Button
                type="button"
                onClick={handleAddAction}
                className="w-full sm:w-auto"
              >
                Add
              </Button>
            </div>

            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md border px-3 py-1 text-sm"
                  >
                    <span className="capitalize">
                      {action.platform} {action.actionType} (x{action.quantity})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
