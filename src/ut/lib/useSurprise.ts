import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { pick } from "./random";
import { TOOLS } from "./registry";
import { sfx } from "./sound";
import type { ToolMeta } from "./types";

export function randomTool(): ToolMeta {
  return pick(TOOLS);
}

/** Navigates to a random tool/game, for the "Surprise Me" buttons. */
export function useSurprise() {
  const navigate = useNavigate();
  return useCallback(() => {
    const tool = randomTool();
    sfx("whoosh");
    navigate(tool.kind === "game" ? `/game/${tool.id}` : `/tool/${tool.id}`);
  }, [navigate]);
}

export function toolPath(tool: ToolMeta): string {
  return tool.kind === "game" ? `/game/${tool.id}` : `/tool/${tool.id}`;
}
