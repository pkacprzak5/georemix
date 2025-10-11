import { Progress } from "@/components/ui/progress";

interface LoadingProps {
  progress: number;
}

export function LoadingScreen({ progress }: LoadingProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl 2xl:text-3xl 3xl:text-5xl font-semibold flex gap-1 2xl:gap-1.5 3xl:gap-2 4xl:gap-2.5  3xl:mb-4 items-end">
          Ładowanie
          <div className="flex gap-1 2xl:gap-1.5 3xl:gap-2  ml-1 mb-[5px]">
            <div className="w-1 2xl:w-1.5 3xl:w-2  aspect-square bg-current rounded-full animate-bounce-delay-0"></div>
            <div className="w-1 2xl:w-1.5 3xl:w-2  aspect-square bg-current rounded-full animate-bounce-delay-1"></div>
            <div className="w-1 2xl:w-1.5 3xl:w-2  aspect-square bg-current rounded-full animate-bounce-delay-2"></div>
          </div>
        </div>
        <Progress value={progress} className="w-lg 3xl:h-6 2xl:w-3xl 3xl:w-5xl 4xl:w-5xl" />
      </div>
    </div>
  );
}
