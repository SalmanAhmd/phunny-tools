import { Suspense, lazy, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useParams, Link, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Footer, NavBar, PageTransition, CommandPalette } from '@/components/Layout'
import { Toaster } from '@/components/ui/Toaster'
import { CursorBlob } from '@/components/ui/CursorBlob'
import { LoadingDots } from '@/components/ui/Primitives'
import { GAMES, TOOL_MAP, TOOLS } from '@/lib/tools'
import { useNonsense } from '@/store/nonsense'
import Home from '@/pages/Home'
import AllTools from '@/pages/AllTools'
import Games from '@/pages/Games'
import MyNonsense from '@/pages/MyNonsense'
import About from '@/pages/About'
import NotFound from '@/pages/NotFound'

/* ----------------------------- lazy tool modules ----------------------------- */

const HammerZip = lazy(() => import('@/tools/HammerZip'))
const CropIt = lazy(() => import('@/tools/CropIt'))
const PdfToWhatever = lazy(() => import('@/tools/PdfToWhatever'))
const FileGym = lazy(() => import('@/tools/FileGym'))
const BlurDepartment = lazy(() => import('@/tools/BlurDepartment'))
const Fontify = lazy(() => import('@/tools/Fontify'))
const UnzipFeelings = lazy(() => import('@/tools/UnzipFeelings'))
const FileRenamer = lazy(() => import('@/tools/FileRenamer'))
const LoadingSimulator = lazy(() => import('@/tools/LoadingSimulator'))
const MeetingGenerator = lazy(() => import('@/tools/MeetingGenerator'))
const ScreenshotEnhancer = lazy(() => import('@/tools/ScreenshotEnhancer'))
const TimeMachine = lazy(() => import('@/tools/TimeMachine'))
const JargonRadio = lazy(() => import('@/tools/JargonRadio'))
const NoiseMachine = lazy(() => import('@/tools/NoiseMachine'))
const ExcuseGenerator = lazy(() => import('@/tools/ExcuseGenerator'))
const MotivationCalculator = lazy(() => import('@/tools/MotivationCalculator'))
const PasswordProcrastinator = lazy(() => import('@/tools/PasswordProcrastinator'))
const PotatoAI = lazy(() => import('@/tools/PotatoAI'))
const MeetingCost = lazy(() => import('@/tools/MeetingCost'))
const ExcuseAction = lazy(() => import('@/tools/ExcuseAction'))
const ButtonPolisher = lazy(() => import('@/tools/ButtonPolisher'))
const DigitalPlant = lazy(() => import('@/tools/DigitalPlant'))

/* ----------------------------- lazy game modules ----------------------------- */

const CatchProductivity = lazy(() => import('@/games/CatchProductivity'))
const WhackABug = lazy(() => import('@/games/WhackABug'))
const ImpossibleDownload = lazy(() => import('@/games/ImpossibleDownload'))
const WrongButton = lazy(() => import('@/games/WrongButton'))
const KeyboardSmash = lazy(() => import('@/games/KeyboardSmash'))
const OfficeEscape = lazy(() => import('@/games/OfficeEscape'))

type LazyComponent = React.LazyExoticComponent<React.ComponentType<any>>

const TOOL_COMPONENTS: Record<string, LazyComponent> = {
  hammerzip: HammerZip,
  crop: CropIt,
  pdf: PdfToWhatever,
  gym: FileGym,
  blur: BlurDepartment,
  fontify: Fontify,
  unzip: UnzipFeelings,
  renamer: FileRenamer,
  loading: LoadingSimulator,
  meeting: MeetingGenerator,
  screenshot: ScreenshotEnhancer,
  timemachine: TimeMachine,
  jargonradio: JargonRadio,
  noisemachine: NoiseMachine,
  excuse: ExcuseGenerator,
  motivation: MotivationCalculator,
  password: PasswordProcrastinator,
  potato: PotatoAI,
  meetingcost: MeetingCost,
  excuseaction: ExcuseAction,
  polisher: ButtonPolisher,
  plant: DigitalPlant,
}

const GAME_COMPONENTS: Record<string, LazyComponent> = {
  'game-catch': CatchProductivity,
  'game-whack': WhackABug,
  'game-download': ImpossibleDownload,
  'game-buttons': WrongButton,
  'game-keyboard': KeyboardSmash,
  'game-escape': OfficeEscape,
}

function Fallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <div className="animate-spin text-4xl" aria-hidden>
        ⚙️
      </div>
      <LoadingDots label="Summoning unnecessary machinery" />
    </div>
  )
}

function MissingExperience({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="text-5xl" aria-hidden>
        🧭
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted dark:text-cream/60">
        We built this page in a meeting and then cancelled the meeting.
      </p>
      <Link to="/tools" className="btn btn-primary mt-6">
        Back to the tools
      </Link>
    </div>
  )
}

function ToolExperience() {
  const { toolId } = useParams()
  const meta = toolId ? TOOL_MAP[toolId] : undefined
  const Component = toolId ? TOOL_COMPONENTS[toolId] : undefined
  const { registerTool } = useNonsense()

  useEffect(() => {
    if (toolId && meta) registerTool(toolId)
  }, [toolId, meta, registerTool])

  if (!meta || !Component) return <MissingExperience title="That tool does not exist" />
  return (
    <Suspense fallback={<Fallback />}>
      <Component />
    </Suspense>
  )
}

function GameExperience() {
  const { gameId } = useParams()
  const game = gameId ? GAMES.find((g) => g.path === `/games/${gameId}`) : undefined
  const component = game ? GAME_COMPONENTS[game.id] : undefined
  const { registerGame } = useNonsense()

  useEffect(() => {
    if (game && component) registerGame(game.id)
  }, [game, component, registerGame])

  if (!component) return <MissingExperience title="That game does not exist" />
  const GameComponent = component
  return (
    <Suspense fallback={<Fallback />}>
      <GameComponent />
    </Suspense>
  )
}

function SurpriseRoute() {
  const { unlock } = useNonsense()
  const [target] = useState(() => TOOLS[Math.floor(Math.random() * TOOLS.length)])
  useEffect(() => {
    unlock('surprise')
  }, [unlock])
  return <Navigate to={target.path} replace />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <CursorBlob />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border-2 focus:border-ink focus:bg-sunrise focus:px-4 focus:py-2 focus:font-bold"
      >
        Skip to content
      </a>
      <NavBar onOpenSearch={() => setSearchOpen(true)} />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div id="content" className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<AllTools />} />
              <Route path="/tools/:toolId" element={<ToolExperience />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:gameId" element={<GameExperience />} />
              <Route path="/nonsense" element={<MyNonsense />} />
              <Route path="/about" element={<About />} />
              <Route path="/random" element={<SurpriseRoute />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </div>
      <Footer />
      <Toaster />
    </div>
  )
}
