import { Progress } from "@/components/ui/progress";

interface LoadingProps {
  progress: number;
}

export function LoadingScreen({ progress }: LoadingProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="text-lg font-semibold flex gap-1 items-end">
          Loading
          <div className="flex gap-1 ml-1 mb-[5px]">
            <div className="w-1 h-1 bg-current rounded-full animate-bounce-delay-0"></div>
            <div className="w-1 h-1 bg-current rounded-full animate-bounce-delay-1"></div>
            <div className="w-1 h-1 bg-current rounded-full animate-bounce-delay-2"></div>
          </div>
        </div>
        <Progress value={progress} className="w-lg" />
      </div>
    </div>
  );
}
