import {
  lazy,
  Suspense,
  useEffect,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { TOOL_BY_ID } from "./lib/registry";
import { markToolUsed } from "./lib/recent";
import { randomTool, toolPath } from "./lib/useSurprise";
import { sfx } from "./lib/sound";
import { useStats } from "./lib/stats";
import type { ToolMeta } from "./lib/types";
import Home from "./pages/Home";
import AllTools from "./pages/AllTools";
import Games from "./pages/Games";
import Nonsense from "./pages/Nonsense";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

/* ------------------------------- tools -------------------------------- */

const HammerZip = lazy(() => import("./tools/HammerZip"));
const FileGym = lazy(() => import("./tools/FileGym"));
const UnzipYourFeelings = lazy(() => import("./tools/UnzipYourFeelings"));
const TheRenamer = lazy(() => import("./tools/TheRenamer"));
const CropItLikeItsHot = lazy(() => import("./tools/CropItLikeItsHot"));
const ProfessionalBlur = lazy(() => import("./tools/ProfessionalBlur"));
const ScreenshotEnhancer = lazy(() => import("./tools/ScreenshotEnhancer"));
const PdfToWhatever = lazy(() => import("./tools/PdfToWhatever"));
const UnnecessaryMeeting = lazy(() => import("./tools/UnnecessaryMeeting"));
const FontifyYourProblems = lazy(() => import("./tools/FontifyYourProblems"));
const HoldMusicGenerator = lazy(() => import("./tools/HoldMusicGenerator"));
const NotificationSymphony = lazy(() => import("./tools/NotificationSymphony"));
const LoadingBarSimulator = lazy(() => import("./tools/LoadingBarSimulator"));
const TheTimeMachine = lazy(() => import("./tools/TheTimeMachine"));

/* ----------------------------- utilities ------------------------------ */

const ExcuseGenerator = lazy(() => import("./tools/utilities/ExcuseGenerator"));
const MotivationCalculator = lazy(() => import("./tools/utilities/MotivationCalculator"));
const PasswordProcrastinator = lazy(() => import("./tools/utilities/PasswordProcrastinator"));
const ButtonPolisher = lazy(() => import("./tools/utilities/ButtonPolisher"));
const AiPoweredPotato = lazy(() => import("./tools/utilities/AiPoweredPotato"));
const MeetingCostCalculator = lazy(() => import("./tools/utilities/MeetingCostCalculator"));
const ExcuseToAction = lazy(() => import("./tools/utilities/ExcuseToAction"));
const DigitalPlant = lazy(() => import("./tools/utilities/DigitalPlant"));

/* ------------------------------- games -------------------------------- */

const CatchTheProductivity = lazy(() => import("./games/CatchTheProductivity"));
const WhackABug = lazy(() => import("./games/WhackABug"));
const ImpossibleDownload = lazy(() => import("./games/ImpossibleDownload"));
const ClickTheWrongButton = lazy(() => import("./games/ClickTheWrongButton"));
const KeyboardSmash = lazy(() => import("./games/KeyboardSmash"));
const OfficeEscapeRoom = lazy(() => import("./games/OfficeEscapeRoom"));

type LazyComp = LazyExoticComponent<ComponentType>;

const TOOL_COMPONENTS: Record<string, LazyComp> = {
  "hammer-zip": HammerZip,
  "file-gym": FileGym,
  "unzip-your-feelings": UnzipYourFeelings,
  "the-renamer": TheRenamer,
  "crop-it-like-its-hot": CropItLikeItsHot,
  "professional-blur": ProfessionalBlur,
  "screenshot-enhancer": ScreenshotEnhancer,
  "pdf-to-whatever": PdfToWhatever,
  "unnecessary-meeting": UnnecessaryMeeting,
  "fontify-your-problems": FontifyYourProblems,
  "hold-music-generator": HoldMusicGenerator,
  "notification-symphony": NotificationSymphony,
  "loading-bar-simulator": LoadingBarSimulator,
  "the-time-machine": TheTimeMachine,
  // utilities share the /tool route
  "excuse-generator": ExcuseGenerator,
  "motivation-calculator": MotivationCalculator,
  "password-procrastinator": PasswordProcrastinator,
  "button-polisher": ButtonPolisher,
  "ai-powered-potato": AiPoweredPotato,
  "meeting-cost-calculator": MeetingCostCalculator,
  "excuse-to-action": ExcuseToAction,
  "digital-plant": DigitalPlant,
};

const GAME_COMPONENTS: Record<string, LazyComp> = {
  "catch-the-productivity": CatchTheProductivity,
  "whack-a-bug": WhackABug,
  "impossible-download": ImpossibleDownload,
  "click-the-wrong-button": ClickTheWrongButton,
  "keyboard-smash-championship": KeyboardSmash,
  "office-escape-room": OfficeEscapeRoom,
};

function Fallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" role="status">
      <div className="animate-spin text-4xl" aria-hidden>
        ⚙️
      </div>
      <p className="font-display text-sm font-bold">Summoning unnecessary machinery…</p>
    </div>
  );
}

function Missing({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="text-5xl" aria-hidden>
        🧭
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm opacity-70">
        We scheduled a meeting about this experience, then cancelled the meeting.
      </p>
      <Link to="/tools" className="btn btn-pop btn-purple mt-6">
        Back to the tools
      </Link>
    </div>
  );
}

function Experience({
  meta,
  Component,
}: {
  meta?: ToolMeta;
  Component?: LazyComp;
}) {
  const { recordToolUse } = useStats();

  useEffect(() => {
    if (meta) {
      recordToolUse(meta.id);
      markToolUsed(meta.id);
    }
  }, [meta, recordToolUse]);

  if (!meta || !Component) return <Missing title="That does not exist" />;
  return (
    <Suspense fallback={<Fallback />}>
      <Component />
    </Suspense>
  );
}

function ToolRoute() {
  const { toolId } = useParams();
  const meta = toolId ? TOOL_BY_ID.get(toolId) : undefined;
  const Component = toolId ? TOOL_COMPONENTS[toolId] : undefined;
  return <Experience meta={meta} Component={Component} />;
}

function GameRoute() {
  const { gameId } = useParams();
  const meta = gameId ? TOOL_BY_ID.get(gameId) : undefined;
  const Component = gameId ? GAME_COMPONENTS[gameId] : undefined;
  return <Experience meta={meta} Component={Component} />;
}

function SurpriseRoute() {
  const [target] = useState(() => randomTool());
  useEffect(() => {
    sfx("whoosh");
  }, []);
  return <Navigate to={toolPath(target)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<AllTools />} />
        <Route path="/tool/:toolId" element={<ToolRoute />} />
        <Route path="/games" element={<Games />} />
        <Route path="/game/:gameId" element={<GameRoute />} />
        <Route path="/nonsense" element={<Nonsense />} />
        <Route path="/about" element={<About />} />
        <Route path="/random" element={<SurpriseRoute />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}