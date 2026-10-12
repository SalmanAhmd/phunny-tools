export type ToolKind = 'tool' | 'game'

export interface ToolCategory {
  id: string
  label: string
  emoji: string
  blurb: string
}

export const CATEGORIES: ToolCategory[] = [
  { id: 'files', label: 'File Destruction & Management', emoji: '🗂️', blurb: 'Files go in. Regret comes out.' },
  { id: 'images', label: 'Image Crimes', emoji: '🖼️', blurb: 'Your photos have rights. We ignore them.' },
  { id: 'office', label: 'Office Productivity Disasters', emoji: '📎', blurb: 'Professional-looking output, zero professional value.' },
  { id: 'audio', label: 'Audio Nonsense', emoji: '🔊', blurb: 'Sound, but make it a complaint.' },
  { id: 'time', label: 'Time-Wasting Machines', emoji: '⏳', blurb: 'Hours of engineering for seconds of nothing.' },
  { id: 'games', label: 'Mini Games', emoji: '🕹️', blurb: 'Replayable, pointless, mildly addictive.' },
  { id: 'utilities', label: 'Randomly Useless Utilities', emoji: '🧰', blurb: 'Small tools with large problems.' },
]

export interface ToolMeta {
  id: string
  name: string
  emoji: string
  tagline: string
  category: string
  accent: 'sun' | 'lime' | 'grape' | 'orange' | 'pink'
  kind: ToolKind
  path: string
  keywords: string[]
  /** Fictional "engineering effort" for comedy flavour. */
  effort: string
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'hammerzip',
    name: 'HammerZip',
    emoji: '🔨',
    tagline: "The world's worst file compressor. Medieval technology, modern disappointment.",
    category: 'files',
    accent: 'orange',
    kind: 'tool',
    path: '/tools/hammerzip',
    keywords: ['compress', 'zip', 'hammer', 'smash', 'file', 'size'],
    effort: '9 months of R&D',
  },
  {
    id: 'unzip',
    name: 'Unzip Your Feelings',
    emoji: '🗃️',
    tagline: 'Extract files and unresolved emotions. Original archive untouched.',
    category: 'files',
    accent: 'pink',
    kind: 'tool',
    path: '/tools/unzip',
    keywords: ['zip', 'archive', 'extract', 'feelings', 'emotions'],
    effort: '4 sprints',
  },
  {
    id: 'renamer',
    name: 'The World-Famous File Renamer',
    emoji: '🏷️',
    tagline: 'Rename every file like an unqualified intern with too much confidence.',
    category: 'files',
    accent: 'lime',
    kind: 'tool',
    path: '/tools/renamer',
    keywords: ['rename', 'filename', 'intern', 'ceo', 'conspiracy'],
    effort: 'one very long meeting',
  },
  {
    id: 'crop',
    name: "Crop It Like It's Hot",
    emoji: '✂️',
    tagline: 'Professional image cropping by someone who has never used Photoshop.',
    category: 'images',
    accent: 'sun',
    kind: 'tool',
    path: '/tools/crop',
    keywords: ['crop', 'image', 'photo', 'scissors', 'pixel'],
    effort: '2 art degrees',
  },
  {
    id: 'blur',
    name: 'Professional Blur Department',
    emoji: '🕵️',
    tagline: 'We make things harder to recognize. Witness protection for pixels.',
    category: 'images',
    accent: 'grape',
    kind: 'tool',
    path: '/tools/blur',
    keywords: ['blur', 'privacy', 'background', 'witness protection'],
    effort: '6 privacy lawyers',
  },
  {
    id: 'screenshot',
    name: 'The Screenshot Enhancer',
    emoji: '🔍',
    tagline: 'Enhance this blurry screenshot until it becomes a different blurry screenshot.',
    category: 'images',
    accent: 'sun',
    kind: 'tool',
    path: '/tools/screenshot',
    keywords: ['enhance', 'screenshot', 'detective', 'pixels', 'zoom'],
    effort: 'the entire forensic budget',
  },
  {
    id: 'pdf',
    name: 'PDF to Whatever',
    emoji: '📄',
    tagline: 'Convert your important documents into something less important.',
    category: 'office',
    accent: 'orange',
    kind: 'tool',
    path: '/tools/pdf',
    keywords: ['pdf', 'convert', 'jargon', 'invisible ink', 'certificate'],
    effort: '3 compliance reviews',
  },
  {
    id: 'meeting',
    name: 'The Unnecessary Meeting Generator',
    emoji: '📅',
    tagline: 'Turn a simple decision into a calendar crisis with twelve steps.',
    category: 'office',
    accent: 'grape',
    kind: 'tool',
    path: '/tools/meeting',
    keywords: ['meeting', 'agenda', 'stakeholder', 'framework', 'calendar'],
    effort: 'unquantifiable',
  },
  {
    id: 'fontify',
    name: 'Fontify Your Problems',
    emoji: '🔤',
    tagline: "Your problems aren't serious enough. Change their font.",
    category: 'office',
    accent: 'pink',
    kind: 'tool',
    path: '/tools/fontify',
    keywords: ['font', 'comic sans', 'papyrus', 'wingdings', 'corporate'],
    effort: 'one design system',
  },
  {
    id: 'gym',
    name: 'File Weightlifting Gym',
    emoji: '🏋️',
    tagline: 'Your files are weak. Make them emotionally stronger. Size unchanged.',
    category: 'files',
    accent: 'lime',
    kind: 'tool',
    path: '/tools/gym',
    keywords: ['gym', 'file', 'strength', 'protein', 'muscle'],
    effort: '1 personal trainer',
  },
  {
    id: 'jargonradio',
    name: 'Corporate Jargon Radio',
    emoji: '📻',
    tagline: 'A radio station that only broadcasts synergy. Uses your browser voice.',
    category: 'audio',
    accent: 'orange',
    kind: 'tool',
    path: '/tools/jargonradio',
    keywords: ['audio', 'speech', 'jargon', 'radio', 'corporate', 'buzzword'],
    effort: 'a very loud intern',
  },
  {
    id: 'noisemachine',
    name: 'Mislabelled Noise Machine',
    emoji: '🔊',
    tagline: 'White noise in entirely the wrong colours, generated live in your browser.',
    category: 'audio',
    accent: 'grape',
    kind: 'tool',
    path: '/tools/noisemachine',
    keywords: ['audio', 'noise', 'sound', 'colour', 'relax', 'focus'],
    effort: '2 sound engineers arguing',
  },
  {
    id: 'loading',
    name: 'Loading Bar Simulator',
    emoji: '⏳',
    tagline: 'Experience the thrill of waiting for absolutely nothing.',
    category: 'time',
    accent: 'sun',
    kind: 'tool',
    path: '/tools/loading',
    keywords: ['loading', 'progress', 'wait', 'patience', 'stuck'],
    effort: '700 commits',
  },
  {
    id: 'timemachine',
    name: 'The Time Machine',
    emoji: '⏰',
    tagline: 'Recover the time you just wasted. Results may vary. Result is zero.',
    category: 'time',
    accent: 'grape',
    kind: 'tool',
    path: '/tools/timemachine',
    keywords: ['time', 'machine', 'reverse', 'clock', 'rewind'],
    effort: 'an actual paradox',
  },
  {
    id: 'polisher',
    name: 'Button Polisher',
    emoji: '✨',
    tagline: 'Click to make it shinier. It was already clean.',
    category: 'time',
    accent: 'lime',
    kind: 'tool',
    path: '/tools/polisher',
    keywords: ['button', 'polish', 'shine', 'click', 'clean'],
    effort: '100 units of polish',
  },
  {
    id: 'plant',
    name: 'Digital Plant',
    emoji: '🪴',
    tagline: 'A plant that grows only while you do absolutely nothing.',
    category: 'time',
    accent: 'lime',
    kind: 'tool',
    path: '/tools/plant',
    keywords: ['plant', 'focus', 'idle', 'grow', 'distraction'],
    effort: 'a greenhouse',
  },

  // ---------------- Mini games ----------------
  {
    id: 'game-catch',
    name: 'Catch the Productivity',
    emoji: '🧲',
    tagline: 'Catch productivity icons before they turn into snacks and meetings.',
    category: 'games',
    accent: 'lime',
    kind: 'game',
    path: '/games/catch',
    keywords: ['game', 'catch', 'productivity', '30 seconds', 'score'],
    effort: 'one 30-second sprint',
  },
  {
    id: 'game-whack',
    name: 'Whack-a-Bug',
    emoji: '🐛',
    tagline: 'Debug production by hitting it repeatedly. Avoid the feature requests.',
    category: 'games',
    accent: 'orange',
    kind: 'game',
    path: '/games/whack',
    keywords: ['game', 'whack', 'bug', 'debug', 'undefined', 'null'],
    effort: '4 failed hotfixes',
  },
  {
    id: 'game-download',
    name: 'The Impossible Download',
    emoji: '📦',
    tagline: 'A download that starts, stalls, rewinds, and disappoints on purpose.',
    category: 'games',
    accent: 'grape',
    kind: 'game',
    path: '/games/download',
    keywords: ['game', 'download', 'progress', 'stuck', '99 percent'],
    effort: 'unlimited bandwidth, allegedly',
  },
  {
    id: 'game-buttons',
    name: 'Click the Wrong Button',
    emoji: '🚫',
    tagline: 'Every button is a trap. Every label is a lie. Have fun.',
    category: 'games',
    accent: 'pink',
    kind: 'game',
    path: '/games/wrong-button',
    keywords: ['game', 'button', 'trap', 'chaos', 'do not click'],
    effort: 'one UX disaster',
  },
  {
    id: 'game-keyboard',
    name: 'Keyboard Smash Championship',
    emoji: '⌨️',
    tagline: 'Ten seconds. Any keys. A professional chaos rating.',
    category: 'games',
    accent: 'lime',
    kind: 'game',
    path: '/games/keyboard',
    keywords: ['game', 'keyboard', 'typing', 'smash', 'wpm', 'chaos'],
    effort: '10,000 keystrokes',
  },
  {
    id: 'game-escape',
    name: 'Office Escape Room',
    emoji: '🚪',
    tagline: 'Find the meeting link, the final_final_v7, and the person who broke prod.',
    category: 'games',
    accent: 'grape',
    kind: 'game',
    path: '/games/escape',
    keywords: ['game', 'escape', 'puzzle', 'office', 'printer', 'timer'],
    effort: 'one very locked door',
  },

  // ---------------- Randomly useless utilities ----------------
  {
    id: 'excuse',
    name: 'Excuse Generator',
    emoji: '🎭',
    tagline: 'Ridiculous excuses for being late, professionally formatted.',
    category: 'utilities',
    accent: 'sun',
    kind: 'tool',
    path: '/tools/excuse',
    keywords: ['excuse', 'late', 'generator', 'alarm', 'apology'],
    effort: 'half a standup',
  },
  {
    id: 'motivation',
    name: 'Motivation Calculator',
    emoji: '🔋',
    tagline: 'How many minutes can you realistically work before checking your phone?',
    category: 'utilities',
    accent: 'lime',
    kind: 'tool',
    path: '/tools/motivation',
    keywords: ['motivation', 'calculator', 'phone', 'focus', 'minutes'],
    effort: 'one maths degree',
  },
  {
    id: 'password',
    name: 'Password Procrastinator',
    emoji: '🔐',
    tagline: 'A dramatic security analysis of a sample password. Nothing is transmitted.',
    category: 'utilities',
    accent: 'grape',
    kind: 'tool',
    path: '/tools/password',
    keywords: ['password', 'security', 'strength', 'analysis', 'theatre'],
    effort: '3 security audits',
  },
  {
    id: 'potato',
    name: 'AI-Powered Potato',
    emoji: '🥔',
    tagline: 'Extremely confident answers from a fictional root vegetable. Parody.',
    category: 'utilities',
    accent: 'sun',
    kind: 'tool',
    path: '/tools/potato',
    keywords: ['ai', 'potato', 'parody', 'question', 'answer'],
    effort: 'a potato',
  },
  {
    id: 'meetingcost',
    name: 'Meeting Cost Calculator',
    emoji: '💸',
    tagline: 'Watch imaginary money evaporate in real time. Per second.',
    category: 'utilities',
    accent: 'orange',
    kind: 'tool',
    path: '/tools/meeting-cost',
    keywords: ['meeting', 'cost', 'calculator', 'money', 'attendees'],
    effort: 'a finance department',
  },
  {
    id: 'excuseaction',
    name: 'Excuse-to-Action Converter',
    emoji: '📆',
    tagline: 'Converts "I\'ll do it tomorrow" into increasingly elaborate future dates.',
    category: 'utilities',
    accent: 'pink',
    kind: 'tool',
    path: '/tools/excuse-action',
    keywords: ['tomorrow', 'procrastination', 'date', 'converter', 'later'],
    effort: 'an entire calendar team',
  },
]

export const TOOL_MAP: Record<string, ToolMeta> = Object.fromEntries(TOOLS.map((t) => [t.id, t]))

export function toolsByCategory(categoryId: string): ToolMeta[] {
  return TOOLS.filter((t) => t.category === categoryId)
}

export function searchTools(query: string, category = 'all', kind: 'all' | ToolKind = 'all'): ToolMeta[] {
  const q = query.trim().toLowerCase()
  return TOOLS.filter((t) => {
    if (category !== 'all' && t.category !== category) return false
    if (kind !== 'all' && t.kind !== kind) return false
    if (!q) return true
    const haystack = `${t.name} ${t.tagline} ${t.keywords.join(' ')} ${t.category}`.toLowerCase()
    return q.split(/\s+/).every((word) => haystack.includes(word))
  })
}

export const GAMES = TOOLS.filter((t) => t.kind === 'game')
