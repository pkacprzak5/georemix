import { Progress } from "@/components/ui/progress";

interface LoadingProps {
  progress: number;
}

export function LoadingScreen({ progress }: LoadingProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="text-lg font-semibold">Loading...</div>
        <Progress value={progress} className="w-lg" />
      </div>
    </div>
  );
}
