import { LevelStart } from "@/pages/level-start";
import { MockPage } from "@/pages/mock";
import { PlayerNameInput } from "@/pages/player-name-input";
import { StagePicker } from "@/pages/stage-picker";
import { TitlePage } from "@/pages/title";
import type { Module } from "./types";
import { moduleIdMap } from "./types";

export const titleGroup: Module = {
  id: moduleIdMap.TITLE,
  pages: [{ id: "title", component: TitlePage, title: "NVIDIA Geo-Guessing" }],
  initialPage: "title",
};

export const introGroup: Module = {
  id: moduleIdMap.INTRO,
  pages: [
    { id: "player-name-input", component: PlayerNameInput, title: "Insert your name" },
    { id: "about", component: MockPage, title: "About" },
    { id: "leader-board", component: MockPage, title: "Leader Board" },
    { id: "stage-picker", component: StagePicker, title: "Pick the Stage" },
  ],
  initialPage: "player-name-input",
};

export const levelStartGroup: Module = {
  id: moduleIdMap.LEVEL_START,
  pages: [{ id: "level-start", component: LevelStart, title: "Start the Level" }],
};

export const levelEndGroup: Module = {
  id: moduleIdMap.LEVEL_END,
  pages: [{ id: "level-results", component: MockPage, title: "Level Results" }],
};

export const gameEndGroup: Module = {
  id: moduleIdMap.FINAL,
  pages: [{ id: "final", component: MockPage, title: "Summary" }],
};

export const modulesMap = {
  [titleGroup.id]: titleGroup,
  [introGroup.id]: introGroup,
  [levelStartGroup.id]: levelStartGroup,
  [levelEndGroup.id]: levelEndGroup,
  [gameEndGroup.id]: gameEndGroup,
} as const;
