export interface DailyChallenge {
  task: string
  reward: string
  emoji: string
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  { task: 'Spend 30 seconds making a file look heavier without increasing its size.', reward: 'Optical Density Engineer', emoji: '🏋️' },
  { task: 'Crop an image until it is legally a texture, then feel nothing.', reward: 'Senior Pixel Surgeon', emoji: '✂️' },
  { task: 'Generate a meeting about a decision that could have been a shrug.', reward: 'Calendar Architect', emoji: '📅' },
  { task: 'Blur a photo until even you cannot identify it, then label it "evidence".', reward: 'Witness Protection Coordinator', emoji: '🕵️' },
  { task: 'Rename a file so confidently that nobody dares open it.', reward: 'Chief Naming Officer', emoji: '🏷️' },
  { task: 'Watch a progress bar reach 100% and produce absolutely nothing.', reward: 'Patience Laureate', emoji: '⏳' },
  { task: 'Convert a PDF into a document with less legal standing than a napkin.', reward: 'Compliance Enthusiast', emoji: '📄' },
  { task: 'Hammer the same fictional file five times and log zero improvement.', reward: 'Certified Hammer Technician', emoji: '🔨' },
  { task: 'Ask the potato a question and accept the answer without question.', reward: 'Root Vegetable Whisperer', emoji: '🥔' },
  { task: 'Polish a button until it reflects your own disappointment.', reward: 'Surface Finish Specialist', emoji: '✨' },
  { task: 'Reverse time by exactly zero seconds and claim it was successful.', reward: 'Temporal Auditor', emoji: '⏰' },
  { task: 'Find a file name in a ZIP that you have definitely seen before.', reward: 'Emotional Archaeologist', emoji: '🗃️' },
  { task: 'Type pure nonsense for ten seconds and get promoted.', reward: 'Chaos Ratings Analyst', emoji: '⌨️' },
  { task: 'Click a button labelled "Do Not Click" and act surprised.', reward: 'Reverse Psychologist', emoji: '🚫' },
  { task: 'Do nothing for twenty full seconds while a plant grows. This is work.', reward: 'Certified Idler', emoji: '🪴' },
]

export const FAKE_STATS = [
  { label: 'Problems unnecessarily complicated', value: 14291, suffix: '', emoji: '🧩' },
  { label: 'Problems solved efficiently', value: 0, suffix: '', emoji: '🫥' },
  { label: 'Unnecessary confidence', value: 99.9, suffix: '%', emoji: '😎' },
  { label: 'Satisfaction guaranteed', value: 0, suffix: '%', emoji: '🤝' },
]

export const TICKER = [
  'We make easy things unnecessarily difficult',
  'Productivity is temporary. Nonsense is forever.',
  '99% effort · 0% meaningful results',
  'Your problem is our unnecessary process',
  'Why do it in one click when you can do it in seventeen?',
  'Now with 40% more gears',
  'No files were harmed, uploaded, or improved',
]

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Describe the thing you want to do',
    body: 'Ideally something simple, like "make this smaller". We will treat this as a philosophical inquiry.',
    emoji: '🗣️',
  },
  {
    step: '02',
    title: 'We convene a committee',
    body: 'Six stakeholders, one shared calendar, zero decision-making authority. Coffee will be lukewarm.',
    emoji: '🧑‍💼',
  },
  {
    step: '03',
    title: 'Machinery is deployed',
    body: 'Gears spin. Smoke appears. Somewhere, a progress bar crosses 48% and then forgets what it was doing.',
    emoji: '⚙️',
  },
  {
    step: '04',
    title: 'Results are withheld for your safety',
    body: 'Your original file remains perfectly intact, which is the funniest possible outcome.',
    emoji: '🛡️',
  },
  {
    step: '05',
    title: 'You receive an achievement',
    body: 'Entirely fictional, permanently stored in your browser, emotionally priceless.',
    emoji: '🏅',
  },
]

export const CORPORATE_JARGON = [
  'circle back',
  'low-hanging fruit',
  'move the needle',
  'take this offline',
  'align on a north star',
  'boil the ocean',
  'ping me offline',
  'double-click on that',
  'socialise the deck',
  'parking lot that',
  'open the kimono',
  'sync on the ask',
  'level-set expectations',
  'run it up the flagpole',
  'peel the onion',
]

export const TESTIMONIALS_ARE_FAKE_NOTE =
  'We do not have testimonials. We have a potato. It is more honest than most marketing departments.'

export const ABOUT_PARAGRAPHS = [
  {
    heading: 'Our Founding Story',
    body: 'In 2019, a group of engineers were asked to build a button that toggles a light. They delivered a microservice architecture, a design system, a nine-stage approval pipeline, and finally a button that toggles a light. Costs rose 4,000%. The light still does not work reliably. We consider this a triumph.',
  },
  {
    heading: 'Our Philosophy',
    body: 'Efficiency is a myth invented by people who finish things. We believe every simple task deserves a richly unnecessary journey full of gears, jargon, and dramatically slow progress bars. If a job could be done in one click, we will find seventeen ways to do it badly.',
  },
  {
    heading: 'Our Commitment To You',
    body: 'We promise never to improve anything. We promise to keep your files local, untouched, and blissfully unoptimised. We promise that every statistic on this website is fabricated, every certificate is meaningless, and every achievement is stored only in your own browser where it can do no harm.',
  },
  {
    heading: 'Frequently Unanswered Questions',
    body: 'Yes, everything is a joke. No, your file was not compressed. Yes, the potato is real (it is a div with a face). No, we cannot recover the time you have spent here, and believe us, we tried.',
  },
]
