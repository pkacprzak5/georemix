import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { Button } from "@/components/ui/button";
import { moduleIdMap } from "@/lib/navigation-system/types";

export function FinalResult() {
  const { navigateTo } = useNavigation();

  const handleClick = () => {
    navigateTo(moduleIdMap.INTRO, 'player-name-input')
  }

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" >Thank you for playing</h1>
        <Button onClick={handleClick}>Goodbye!</Button>
      </div>
    </div>
  );
}
