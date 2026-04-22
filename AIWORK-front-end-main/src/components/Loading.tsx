import { Spinner } from "./ui/spinner";

interface Props {
  size?: number;
  classWrapper?: string;
  icon?: React.ReactNode;
  color?: string;
  strokeWidth?: number;
}
export function Loading({ size = 40, classWrapper = "", icon, color = "#FAAB2E", strokeWidth = 4 }: Props) {
  return (
    <div className={`flex h-screen w-full items-center justify-center ${classWrapper}`}>
      <div className="flex flex-col items-center gap-4">
        <Spinner size={size} icon={icon} color={color} strokeWidth={strokeWidth} />
      </div>
    </div>
  );
}
