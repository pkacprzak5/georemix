import type { Group } from "./types";
import { GroupName } from "./types";
import { HomePage } from "../../components/pages/HomePage";
import { SettingsPage } from "../../components/pages/SettingsPage";
import { GamePage } from "../../components/pages/GamePage";
import { WelcomePage } from "../../components/pages/WelcomePage";


export const mainGroup: Group = {
  id: GroupName.MAIN_MENU,
  pages: [
    { id: "home", component: HomePage, title: "Home" },
    { id: "settings", component: SettingsPage, title: "Settings" },
    { id: "game", component: GamePage, title: "Game" },
  ],
  initialPage: "home",
};

export const welcomeGroup: Group = {
  id: GroupName.WELCOME,
  pages: [
    { id: "welcome", component: WelcomePage, title: "Welcome" },
  ],
  initialPage: "welcome",
};

export const levelStartGroup: Group = {
  id: GroupName.LEVEL_START,
  pages: [
    // Define level start pages here
  ],
  initialPage: undefined, // Set to the appropriate initial page ID
};

export const levelEndGroup: Group = {
  id: GroupName.LEVEL_END,
  pages: [
    // Define level end pages here
  ],
  initialPage: undefined, // Set to the appropriate initial page ID
};

export const gameEndGroup: Group = {
  id: GroupName.GAME_END,
  pages: [
    // Define game end pages here
  ],
  initialPage: undefined, // Set to the appropriate initial page ID
};

// Map of group name -> Group for easy lookup/registration
export const GROUPS_MAP: Map<GroupName, Group> = new Map([
  [welcomeGroup.id as GroupName, welcomeGroup],
  [mainGroup.id as GroupName, mainGroup],
  [levelStartGroup.id as GroupName, levelStartGroup],
  [levelEndGroup.id as GroupName, levelEndGroup],
  [gameEndGroup.id as GroupName, gameEndGroup],
]);

export function getGroupByName(name: GroupName): Group | undefined {
  return GROUPS_MAP.get(name);
}
