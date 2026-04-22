import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
interface StepEditInputProps {
  stepName: string;
  duration: number;
  onSave: (
    name: string,
    duration: number,
    unit: "minutes" | "hours" | "seconds"
  ) => void;
  onCancel: () => void;
}

export const StepEditInput = ({
  stepName,
  duration,
  onSave,
  onCancel,
}: StepEditInputProps) => {
  const [name, setName] = useState(stepName);
  const [durationValue, setDurationValue] = useState(duration.toString());
  const [unit, setUnit] = useState<"minutes" | "hours" | "seconds">("minutes");

  const handleSave = () => {
    if (name.trim() === "") {
      toast.error("Step name is required");
      return;
    }
    if (durationValue.trim() === "" || parseInt(durationValue) === 0) {
      toast.error("Step duration is required and must be greater than 0");
      return;
    }
    onSave(name, parseInt(durationValue), unit);
  };

  return (
    <>
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <div className="flex gap-2">
        <Input
          className="w-20 focus:w-32 transition-all duration-200"
          value={durationValue}
          onChange={(e) => setDurationValue(e.target.value)}
          type="number"
          min="0"
        />
        <Select value={unit} onValueChange={(v) => setUnit(v as any)}>
          <SelectTrigger className="w-16 transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-white">
            <SelectItem value="minutes">m</SelectItem>
            <SelectItem value="seconds">s</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleSave}
        className="p-2 rounded-xl"
      >
        <Check />
      </Button>
    </>
  );
};
