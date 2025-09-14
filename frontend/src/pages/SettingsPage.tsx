import { Button } from "@/components/ui/button";
import { useNavigation } from "@/lib/navigation-system/NavigationProvider";
import { groupNameMap } from "@/lib/navigation-system/types";

export function SettingsPage() {
  const { navigateTo, showMenu } = useNavigation();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="flex flex-col gap-2">
        <Button onClick={() => navigateTo(groupNameMap.MAIN_MENU, "home")}>Go to Home</Button>
        <Button onClick={() => navigateTo(groupNameMap.MAIN_MENU, "game")}>Go to Game</Button>
        <Button onClick={showMenu}>Show Menu</Button>
      </div>
    </div>
  );
}
