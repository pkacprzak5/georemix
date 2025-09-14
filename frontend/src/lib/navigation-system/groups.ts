import type { Group } from "./types";
import { groupNameMap } from "./types";
import { HomePage } from "../../pages/HomePage";
import { SettingsPage } from "../../pages/SettingsPage";
import { GamePage } from "../../pages/GamePage";
import { TitlePage } from "../../pages/TitlePage";
import { PlayerSelect } from "../../pages/PlayerSelect";
import { RoundSelect } from "../../pages/RoundSelect";

export const mainGroup: Group = {
  id: groupNameMap.MAIN_MENU,
  pages: [
    { id: "home", component: HomePage, title: "Home" },
    { id: "settings", component: SettingsPage, title: "Settings" },
    { id: "game", component: GamePage, title: "Game" },
  ],
  initialPage: "home",
};

export const titleGroup: Group = {
  id: groupNameMap.TITLE,
  pages: [{ id: "title", component: TitlePage, title: "NVIDIA Geo-Guessing" }],
  initialPage: "title",
};

export const initGroup: Group = {
  id: groupNameMap.INIT_GROUP,
  pages: [
    { id: "player-select", component: PlayerSelect, title: "Player Select" },
    { id: "round-select", component: RoundSelect, title: "Round Select" },
  ],
  initialPage: "player-select",
};

export const levelStartGroup: Group = {
  id: groupNameMap.LEVEL_START,
  pages: [
    // Define level start pages here
  ],
  initialPage: undefined, // Set to the appropriate initial page ID
};

export const levelEndGroup: Group = {
  id: groupNameMap.LEVEL_END,
  pages: [
    // Define level end pages here
  ],
  initialPage: undefined, // Set to the appropriate initial page ID
};

export const gameEndGroup: Group = {
  id: groupNameMap.GAME_END,
  pages: [
    // Define game end pages here
  ],
  initialPage: undefined, // Set to the appropriate initial page ID
};

// Map of group name -> Group for easy lookup/registration
export const GROUPS_MAP: Map<GroupName, Group> = new Map([
  [titleGroup.id as GroupName, titleGroup],
  [initGroup.id as GroupName, initGroup],
  [mainGroup.id as GroupName, mainGroup],
  [levelStartGroup.id as GroupName, levelStartGroup],
  [levelEndGroup.id as GroupName, levelEndGroup],
  [gameEndGroup.id as GroupName, gameEndGroup],
]);

export function getGroupByName(name: GroupName): Group | undefined {
  return GROUPS_MAP.get(name);
}
