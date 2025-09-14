import { Progress } from "@/components/ui/progress";

export function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="text-lg font-semibold">Loading...</div>
        <Progress value={undefined} className="w-32" />
      </div>
    </div>
  );
}
