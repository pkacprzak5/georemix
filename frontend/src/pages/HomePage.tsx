import { Button } from "@/components/ui/button";
import { useNavigation } from "@/lib/navigation-system/NavigationProvider";
import { groupNameMap } from "@/lib/navigation-system/types";

export function HomePage() {
  const { navigateTo, navigateWithLoading, showMenu } = useNavigation();

  const handleNavigateWithLoading = () => {
    const fakePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2000); // 2 second delay
    });
    navigateWithLoading(groupNameMap.MAIN_MENU, "settings", fakePromise);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <div className="flex flex-col gap-2">
        <Button onClick={() => navigateTo(groupNameMap.MAIN_MENU, "settings")}>
          Go to Settings
        </Button>
        <Button onClick={() => navigateTo(groupNameMap.MAIN_MENU, "game")}>Go to Game</Button>
        <Button onClick={handleNavigateWithLoading}>Go to Settings with Loading</Button>
        <Button onClick={showMenu}>Show Menu</Button>
      </div>
    </div>
  );
}
