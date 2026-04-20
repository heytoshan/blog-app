import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Inline models (to avoid circular deps in seed)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  fullName: { type: String, required: true },
  avatar: String,
  bio: String,
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'author', 'admin'], default: 'user' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  featuredImage: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [String],
  tags: [String],
  isPublished: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readTime: { type: Number, default: 5 },
}, { timestamps: true });

import slugify from 'slugify';

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    (this as any).slug = slugify((this as any).title, { lower: true, strict: true });
  }
  const words = (this as any).content.split(/\s+/).length;
  (this as any).readTime = Math.ceil(words / 200);
  next();
});

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
const BlogModel = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

const AVATAR_BASE = 'https://images.unsplash.com/photo-';
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=700&fit=crop', // AI
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=700&fit=crop', // laptop
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&h=700&fit=crop', // code
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=700&fit=crop', // design
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=700&fit=crop', // startup
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=700&fit=crop', // mountains
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=700&fit=crop', // productivity
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=700&fit=crop', // tech
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=700&fit=crop', // analytics
  'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=1200&h=700&fit=crop', // creativity
];

const seedUsers = [
  {
    username: 'alex_writes',
    email: 'alex@blogy.dev',
    fullName: 'Alex Thompson',
    password: 'Password123',
    role: 'author',
    bio: 'Senior engineer at Google. Writing about the future of technology, AI, and the human condition.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  },
  {
    username: 'sarah_design',
    email: 'sarah@blogy.dev',
    fullName: 'Sarah Chen',
    password: 'Password123',
    role: 'author',
    bio: 'Product designer & creative director. I believe great design changes the world.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  },
  {
    username: 'marcus_dev',
    email: 'marcus@blogy.dev',
    fullName: 'Marcus Williams',
    password: 'Password123',
    role: 'author',
    bio: 'Full-stack developer & startup founder. Building the future one commit at a time.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  },
  {
    username: 'priya_startup',
    email: 'priya@blogy.dev',
    fullName: 'Priya Patel',
    password: 'Password123',
    role: 'author',
    bio: 'VC-backed founder x 2. Writing about startups, fundraising, and the entrepreneurial life.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  },
  {
    username: 'james_productivity',
    email: 'james@blogy.dev',
    fullName: 'James Rodriguez',
    password: 'Password123',
    role: 'author',
    bio: 'Author of "Deep Work Decoded". Obsessed with how we can all do more meaningful work.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  },
];

const seedBlogs = [
  {
    title: 'The Age of AI: Why Every Developer Must Learn Prompt Engineering',
    excerpt: 'AI is no longer a buzzword — it is the most important paradigm shift in software development since the internet. Here is why every developer needs to embrace it now.',
    content: "The landscape of software development is changing faster than at any point in the last two decades. With the rise of large language models, the very act of building software is being redefined.\n\n## What is Prompt Engineering?\n\nPrompt engineering is the practice of carefully crafting inputs to AI models to get optimal outputs. Think of it as learning to communicate with a very powerful, very literal-minded colleague.\n\nThe key insight is that these models are not search engines. They are reasoning engines. When you ask them a question, they don't look up an answer — they construct one based on patterns learned during training.\n\n## Why It Matters for Developers\n\nAs a developer in 2024, your value is no longer in memorizing syntax or knowing which Stack Overflow answer to copy. Your value is in:\n\n1. **Problem decomposition** — Breaking complex problems into manageable pieces\n2. **Verification thinking** — Knowing when an AI output is correct or subtly wrong\n3. **System design** — Understanding how components fit together at scale\n4. **Prompt orchestration** — Chaining AI capabilities to build complex workflows\n\n## The Practical Reality\n\nCompanies that have adopted AI-assisted development report 30–40% increases in developer productivity. Not by replacing developers — but by handling the boilerplate, the documentation, the routine refactoring.\n\nThe developers who will thrive are the ones who use these tools to amplify their creativity, not the ones who resist them out of fear.\n\n## Getting Started Today\n\nStart simple. Use AI to:\n- Write tests for your existing code\n- Generate documentation from comments\n- Explore alternative implementations\n- Debug subtle errors with a second pair of eyes\n\nThe skill is not in using the tool — it is in knowing exactly what to use it for.\n\nThe future belongs to developers who can think at a higher level of abstraction, letting AI handle the details while they focus on the big picture. That future is not coming. It is already here.",
    categories: ['Technology', 'AI'],
    tags: ['ai', 'programming', 'productivity', 'future'],
    featuredImage: COVER_IMAGES[0],
    views: 4823,
  },
  {
    title: 'Design Systems at Scale: Lessons from Building a Design Language',
    excerpt: 'After three years building design systems for Fortune 500 companies, I have learned what truly makes a great design system — and what absolutely kills one.',
    content: "Design systems are having a moment. Every company, from two-person startups to global enterprises, is either building one, rewriting one, or desperately wishing they had one.\n\nHaving built and maintained design systems at three different companies over the past three years, I have developed strong opinions about what actually works.\n\n## The Foundation: Tokens, Not Components\n\nThe biggest mistake teams make is starting with components. Components are the wrong layer to start at.\n\nStart with **design tokens** — the atomic building blocks that everything else derives from. Colors, spacing, typography scales, motion curves, shadow values.\n\nWhen you define a token like '--color-brand-500: hsl(220, 90%, 55%)', you are making a decision once that ripples through every component automatically. When your brand color changes (and it will), you change one value and everything updates.\n\n## The Naming Problem\n\nAvoid semantic names tied to current colors: '--color-blue-primary'. What happens when your brand shifts to purple?\n\nInstead, use **intent-based naming**: '--color-action-primary', '--color-surface-elevated', '--color-text-subtle'. These names survive brand refreshes.\n\n## Components: The Living Breathing Layer\n\nOnce your tokens are solid, components are actually fun to build. The key principle: **components should have no opinions about context**.\n\nA Button should not know whether it appears in a modal or a page header. A Card should not know if it contains a product or a blog post.\n\n## Documentation: The Part Everyone Skips\n\nHere is the uncomfortable truth: a design system without documentation is just a pile of components.\n\nGreat documentation answers three questions for every component:\n1. **When should I use this?**\n2. **When should I NOT use this?**\n3. **What are the accessibility considerations?**\n\n## Governance: Who Decides What?\n\nThe most underestimated challenge is not technical — it is organizational. Who has the authority to add new components? Who can deprecate old ones? What is the process for proposing changes?\n\nWithout clear governance, design systems become graveyards of inconsistency.\n\nThe teams that get this right treat the design system like a product — with a roadmap, stakeholders, regular reviews, and a clear owner.",
    categories: ['Design', 'Technology'],
    tags: ['design', 'ui', 'systems', 'css'],
    featuredImage: COVER_IMAGES[3],
    views: 3201,
  },
  {
    title: 'How I Built a $50K/Month SaaS With Zero Marketing Budget',
    excerpt: 'One year ago I launched my first SaaS product. Today it generates $50,000 per month. No ads, no agency, no VC money. Here is the exact playbook.',
    content: "Twelve months ago I pushed my first commit to production for a product nobody had heard of. Today, that product generates $50,000 per month in recurring revenue.\n\nI did not raise money. I did not run ads. I barely even tweeted about it for the first four months.\n\nHere is exactly what happened.\n\n## The Problem I Solved\n\nI was working as a freelance developer, spending 6+ hours per week on invoicing, proposals, and client follow-ups. The existing tools were either too expensive or too clunky.\n\nSo I built a simpler one. For myself.\n\nThat is lesson number one: **solve your own problem first**.\n\n## The First 100 Customers\n\nI did not launch with a bang. I launched by posting in three specific communities where I knew developers hung out:\n\n- A Slack workspace for indie hackers\n- A Reddit thread about freelancer tools\n- A Discord server for React developers\n\nThe post was not promotional. It was a story: 'I built this for myself and 20 people asked for access. If you want to try it, here is a link.'\n\nThat generated 73 signups on day one.\n\n## The Pricing Psychology\n\nI made a mistake many founders make: I priced too low.\n\nMy first price was $9/month. It attracted the worst kind of customers — people who complained about every minor bug, demanded features immediately, and churned after two months.\n\nWhen I raised the price to $49/month, something magical happened: better customers. People who took the product more seriously because they had invested more.\n\n**Lesson: price is a filter.**\n\n## The Retention Formula\n\nMRR growth = new customers + existing customers staying\n\nMost founders obsess over acquisition. The real game is retention.\n\nEvery month I do three things:\n1. Email every churned customer asking why they left (not to win them back — to understand)\n2. Email every customer who has been with me 6+ months asking what they love\n3. Ship one feature that solves a pain mentioned by at least three customers\n\nThat is it. No complex retention funnel. Just listening and building.\n\n## The Revenue Milestone\n\nMonth 1: $441\nMonth 3: $2,800\nMonth 6: $12,300\nMonth 9: $31,000\nMonth 12: $50,200\n\nThe growth was not linear. Months 2 through 5 were brutal. The jump came when I was featured in a popular newsletter — something I had not chased or paid for. A subscriber had recommended me.\n\nThe best marketing is a product people cannot stop talking about.",
    categories: ['Startups', 'Business'],
    tags: ['saas', 'entrepreneurship', 'revenue', 'growth'],
    featuredImage: COVER_IMAGES[4],
    views: 6750,
  },
  {
    title: 'Deep Work in the Age of Notifications: A Practical Framework',
    excerpt: 'Cal Newport changed my life with one idea. But implementing deep work in the modern world requires more than just turning off Slack. Here is a battle-tested framework.',
    content: "I have tried every productivity system: GTD, time-blocking, the Pomodoro technique, inbox zero, weekly reviews. I have read every book on the subject.\n\nNothing changed my relationship with work more than Cal Newport's concept of deep work — the ability to produce cognitively demanding output without distraction.\n\nBut there is a gap between understanding the concept and actually living it.\n\n## The Attention Economy Is Working Against You\n\nEvery app on your phone is engineered by a team of world-class engineers whose sole job is to capture and hold your attention. You are not fighting against notifications. You are fighting against billion-dollar companies staffed with Ph.Ds in behavioral psychology.\n\nUnderstanding this reframed my approach. Willpower alone will not work. You need **architecture**.\n\n## The Four Depth Levels\n\nI categorize my work into four depth levels:\n\n**Depth 0** — Correspondence, scheduling, admin. Can be done half-asleep.\n**Depth 1** — Reading, light editing, planning. Requires some focus.\n**Depth 2** — Writing, strategy, problem analysis. Requires significant focus.\n**Depth 3** — The hardest, most creative work. The stuff only I can do.\n\nThe framework is simple: **protect Depth 3 time with your life**.\n\n## The Morning Fortress\n\nI do not check email before 11am. No exceptions. No emergencies. If something was truly an emergency, someone would call.\n\nMy first two hours are sacred. I wake up, make coffee, and immediately work on my most important Depth 3 task. No phone. No computer notifications. No news.\n\nThis single change unlocked more creative output than anything else I have tried.\n\n## The Battery Model\n\nDeep work is not like a muscle — it is more like a battery.\n\nA fully charged person can sustain about 4 hours of genuine Depth 3 work per day. That is it. Elite performers do not do more — they do less, but better.\n\nThe goal is to spend those 4 hours on work that matters, not to squeeze more hours out of your already depleted brain.\n\n## What 'Shallow' Work Actually Costs\n\nEvery time you switch from deep to shallow work, you pay a switching cost. Research suggests this can be anywhere from 15 to 45 minutes of reduced effectiveness.\n\nIf you have 12 interruptions in a workday, you may never reach deep work at all. You are too busy recovering from the last interruption.\n\nCalculate your real productive output for one week. Many people discover they are doing about 90 minutes of actual deep work in an 8-hour day.\n\n## The Practice\n\nStart small. Carve out 60 minutes tomorrow morning. No phone. No Slack. One task.\n\nNotice how it feels. Notice the discomfort — that urge to check something. That discomfort is the feeling of your attention being reclaimed.\n\nDo that every day for two weeks. Then extend to 90 minutes.\n\nYou will not believe what you can create.",
    categories: ['Productivity', 'Mindset'],
    tags: ['productivity', 'focus', 'deep-work', 'habits'],
    featuredImage: COVER_IMAGES[6],
    views: 5432,
  },
  {
    title: 'TypeScript in 2024: Why the Hype Is Completely Justified',
    excerpt: 'TypeScript adoption has crossed the majority threshold among JavaScript developers. If you are still on the fence, this post covers everything that will change your mind.',
    content: "I resisted TypeScript for two years. I called it 'JavaScript with training wheels.' I complained about the boilerplate. I missed the freedom of just writing JavaScript.\n\nThen I joined a team shipping TypeScript at scale. Three months later, I would never go back.\n\nHere is what changed my mind.\n\n## The Refactoring Problem\n\nThe moment TypeScript clicked for me was during a major refactoring project. We needed to rename a function parameter that was used in 47 different places across the codebase.\n\nIn JavaScript? That is a nerve-wracking global search-and-replace, a prayer, and a testing marathon.\n\nIn TypeScript? Rename the parameter. Watch the compiler instantly show you all 47 call sites that need updating. Fix them. Done.\n\nI saved two hours of debugging in one afternoon.\n\n## Types Are Documentation That Does Not Rot\n\nEvery codebase has documentation that lies. Comments go stale. READMEs get out of date. Confluence pages become monuments to past decisions.\n\nTypes are different. They are enforced by the compiler. If the type says a function returns '{ user: User; token: string }', that is what it returns. Always. Or the build fails.\n\n## The IDE Experience Is Transformative\n\nThis is underrated. With TypeScript, your editor knows the shape of every object. It can:\n\n- Autocomplete properties as you type\n- Warn you when you access a property that might be null\n- Show you the full type of any variable on hover\n- Automatically import the types you need\n\nAfter a few weeks with good TypeScript IDE support, writing untyped JavaScript feels like coding with oven mitts.\n\n## What About the Overhead?\n\n'TypeScript takes longer to write.'\n\nThis is true for the first 30 minutes. False for the lifetime of the project.\n\nThe time you invest in writing types comes back tenfold in:\n- Fewer bugs reaching production\n- Faster onboarding for new developers\n- Reduced time spent reading source code to understand function signatures\n- Safer refactoring\n\n## Starting Today\n\nYou do not need to rewrite your entire project. TypeScript is JavaScript — valid JavaScript is valid TypeScript. Start by renaming your entry file from '.js' to '.ts', fix the immediate errors, and go file by file.\n\nOr use '// @ts-check' in your existing JS files. It gives you 70% of the TypeScript benefit with zero migration cost.\n\nThe only thing you will regret is not starting sooner.",
    categories: ['Technology', 'Programming'],
    tags: ['typescript', 'javascript', 'webdev', 'programming'],
    featuredImage: COVER_IMAGES[2],
    views: 3890,
  },
  {
    title: 'The Minimalist Manifesto: Less UI, More Experience',
    excerpt: 'The best design is often the design you do not notice. After studying the most beloved digital products, I have a theory about why minimalism wins.',
    content: "There is a design principle that sounds obvious but is almost universally violated: **every element on screen should earn its place**.\n\nNot every element that is 'useful.' Not every element the product manager requested. Every element that helps the user accomplish what they came to do.\n\n## The Cost of Visual Noise\n\nEvery pixel you add to an interface has a cost. It asks users to parse it, decide if it is important, and allocate attention to it accordingly.\n\nWhen an interface has 50 elements, each one receives 1/50th of the user's attention. When an interface has 5 elements, each one receives 1/5th.\n\nThe fewer the elements, the more power each one has.\n\n## Case Study: Apple's Evolution\n\nLook at the evolution of any Apple product category. The first iPod had many buttons. By the iPhone, there was one. The AirPods have zero.\n\nApple's design philosophy is not 'fewer buttons because it looks cool.' It is 'we should only show controls when the user needs them.' Context-sensitive minimalism.\n\n## The Three Laws of Minimalist UI\n\n**Law 1: Remove before you add.**\nBefore adding a new element, ask: can I achieve this goal by removing something else instead?\n\n**Law 2: Merge before you separate.**\nBefore creating a new section, ask: can this information live somewhere that already exists?\n\n**Law 3: Gray before you color.**\nColor draws the eye. Only use it where you want the user to look first. Everything else should be neutral.\n\n## White Space Is Not Wasted Space\n\nThe most common objection to minimalist design: 'We are leaving so much space empty.'\n\nBut white space is not emptiness — it is breathing room. It allows the elements that remain to be seen more clearly. It creates hierarchy. It communicates confidence.\n\nA design that is afraid of white space is a design that is afraid the content is not good enough on its own.\n\n## The Hard Part\n\nMinimalism is not the absence of decision-making. It is the result of making harder decisions.\n\nDeciding to include something is easy. Deciding what to leave out — that requires real clarity about what your product is for and who it serves.\n\nThe best minimal designs are the result of a designer saying 'no' a hundred times.",
    categories: ['Design', 'Philosophy'],
    tags: ['design', 'ux', 'minimalism', 'ui'],
    featuredImage: COVER_IMAGES[7],
    views: 2940,
  },
  {
    title: 'Building With React Server Components: A Honest Assessment',
    excerpt: 'React Server Components promised to revolutionize how we build web applications. After six months of production use, here is my unfiltered take.',
    content: "I have spent the last six months building a production application that leans heavily on React Server Components. The experience has been eye-opening — sometimes delightfully so, sometimes painfully so.\n\nHere is my honest, unfiltered assessment for developers considering them.\n\n## What RSC Actually Solves\n\nThe fundamental problem RSC addresses is the dual rendering problem: your JavaScript ships twice — once as server-rendered HTML (for initial page load), and once as JavaScript bundle code (for hydration and interactivity).\n\nWith RSC, server components ship as HTML and never become JavaScript on the client. They cannot have state. They cannot use hooks. And that is exactly the point.\n\n## Where They Shine\n\n**Data fetching at the component level.** This is genuinely new and powerful. Instead of fetching all your data in a page-level 'getServerSideProps' and passing it down as props, each component can fetch exactly what it needs, directly.\n\n---CODE_START---\n// This runs only on the server. No API call from the client.\nasync function BlogPost({ slug }: { slug: string }) { \n  const blog = await db.blog.findUnique({ where: { slug } });\n  return <article>{blog.content}</article>;\n}\n---CODE_END---\n\nThe waterfall potential is real, but with proper 'Promise.all' batching, it is manageable.\n\n**Zero-bundle-size for server components.** A markdown parser, syntax highlighter, or date library that only runs on the server never ships to the client. Real, measurable bundle size reductions.\n\n## Where They Frustrate\n\n**Serialization limitations.** You cannot pass functions from server to client components as props. This sounds minor until you are deep in a refactor realizing that your component tree's entire architecture is wrong.\n\n**The 'use client' boundary.** It proliferates. You start conservatively and end up with 'use client' at the top of every file because one child somewhere used 'useState'.\n\n**Error messages.** They are improving, but when something goes wrong at the server/client boundary, the errors can be cryptic.\n\n## My Verdict\n\nRSC is the future. I genuinely believe that. The model is correct: move as much computation and data fetching as possible to the server, ship the minimum JavaScript to the client.\n\nBut the tooling, documentation, and ecosystem conventions are still maturing. If you are building a new project in Next.js 14+, use them — but budget extra time for learning the patterns.\n\nIf you are migrating an existing application, do it incrementally. Convert leaf nodes first. Learn the boundaries. Then work upward.\n\nThe productivity gains at the top of the learning curve are real.",
    categories: ['Technology', 'Programming'],
    tags: ['react', 'nextjs', 'javascript', 'webdev'],
    featuredImage: COVER_IMAGES[1],
    views: 4100,
  },
  {
    title: 'The Psychology of Color in Product Design',
    excerpt: 'Color is not just aesthetic decoration. It communicates trust, urgency, status, and emotion. Here is the psychology that every designer needs to understand.',
    content: "Color is the silent salesperson of every digital product. Before a user reads a word of your copy, before they interact with a single button, color has already communicated something about your brand.\n\nUnderstanding the psychology behind color choices transforms you from a decorator into a communication designer.\n\n## Colors Carry Cultural Luggage\n\nRed means stop, danger, emergency — in Western culture. In China, red symbolizes luck and prosperity. In South Africa, it represents mourning.\n\nBefore you apply any color psychology framework, ask: **who is this product for, and what does this color mean to them?**\n\nThis is not relativism — it is precision.\n\n## The Functional Colors\n\nIn digital interfaces, colors do jobs:\n\n**Blue** — Trust, reliability, focus. Dominant in banking (JPMorgan, PayPal), social media (Facebook, LinkedIn, Twitter). Users associate blue interfaces with credibility.\n\n**Green** — Success, go, growth, health. Used for confirmation states, financial gains, sustainability brands. 'Complete' buttons in funnels are almost always green for a reason.\n\n**Red** — Error, danger, urgency, attention. Destructive actions (delete, remove) use red to signal the weight of the decision. Also used for sales and discounts because urgency drives action.\n\n**Yellow/Orange** — Warmth, creativity, energy. Used for CTAs when blue is the brand color (contrast principle). Orange on dark backgrounds reads as excitement.\n\n**Purple** — Luxury, creativity, mystery. Fintech apps use purple to signal premium tiers. Creative tools use it to signal expressiveness.\n\n## The Hierarchy Rule\n\nColor is attention. Where you put color is where users will look first.\n\nIn a UI with one colored element — a button, a notification dot, a status indicator — that element commands 100% of the attention spent on color. Add a second colored element and you have a conversation (or argument) about which is more important.\n\nThe most effective designs use a single accent color for actions and information hierarchy.\n\n## Constructing a Palette\n\nA functional color palette has:\n- **Primary brand color** — Your identity. Usually a saturated, memorable hue.\n- **Functional palette** — Semantic colors: success, warning, error, info.\n- **Neutral scale** — 10 steps from near-black to near-white. This is where most of your design lives.\n- **Surface hierarchy** — Background, card, popover — subtle steps of lightness.\n\nThe mistake is adding too many 'brand colors.' Every new color is cognitive overhead. Discipline is a feature.",
    categories: ['Design', 'Psychology'],
    tags: ['design', 'color', 'psychology', 'branding'],
    featuredImage: COVER_IMAGES[9],
    views: 2100,
  },
  {
    title: 'Fundraising in 2024: What VCs Actually Look For (From an Insider)',
    excerpt: 'I spent two years on the VC side before founding my own company. The gap between what investors say they want and what actually gets funded is significant.',
    content: "I spent two years as an associate at a Series A fund before deciding to start my own company. During that time, I reviewed over 800 pitch decks and sat in on more than 200 founder meetings.\n\nWhat I am about to share is not what VCs say publicly. It is what they actually talk about in partner meetings.\n\n## The Traction Conversation\n\nEvery VC says 'traction matters more than ever.' What they do not say is how they calibrate it.\n\nIn partner meetings, the question is not 'do they have traction?' It is 'does the rate of change explain the team's narrative about the opportunity?'\n\nA company with $10K MRR growing 25% month-over-month tells a completely different story than a company with $100K MRR growing 5% month-over-month.\n\nThe second company is larger. But the first company is fundable.\n\n**What VCs see in the growth curve:** Is this product solving a problem people would miss? Is the distribution mechanism organic or paid? What happens to retention?\n\n## The Market Sizing Problem\n\nMost founders hear 'we look for $1B+ markets' and build slides trying to make their market look larger.\n\nThis backfires. Sophisticated investors know the market sizing inflation game. They discount inflated TAMs automatically.\n\nWhat actually works: **bottom-up market sizing with clear assumptions**.\n\n'There are 500,000 small law firms in the US. 40% have 2-10 employees. Our primary buyer is the managing partner. Average ACV is $3,600. That is a $720M addressable market.'\n\nSpecific. Defensible. Shows you understand your customer.\n\n## The Team Question (What No One Tells You)\n\nVCs invest in people. Everyone knows this. What everyone does not know is the specific things they are evaluating:\n\n**Coachability.** In meetings, they are watching to see if you update your views when presented with new information. Stubborn founders are risky founders.\n\n**Self-awareness.** Can you clearly articulate your own weaknesses? Founders who cannot often build blind spots into their company.\n\n**Intellectual horsepower without arrogance.** Investors want founders who are smarter than them about their problem, but humble enough to learn from advisors.\n\n## The Decision Process\n\nThe yes/no decision in venture is easier than people think. The hard decision is conviction.\n\nAn investor might believe your company has a 20% chance of being a $100M outcome. That is actually terrible for a VC fund that needs 10x returns.\n\nThey need to believe in a path to 100x. That means $1B+ outcome, with less than 1% chance of zero.\n\nThe pitch is not 'here is a good business.' The pitch is 'here is why this could be extraordinarily valuable.'\n\n## Advice for Your Next Round\n\n1. Find investors who have funded companies in your category. They already believe the market exists.\n2. Lead with the problem, not the solution. Investors fund problems.\n3. Know your numbers cold. Every number. Every metric. If you stumble, confidence evaporates.\n4. Get a warm introduction. Cold emails close less than 1% of the time.\n\nThe best fundraisers approach it as a relationship game, not a sales pitch. You are looking for a 10-year partner, not a quick transaction.",
    categories: ['Startups', 'Business'],
    tags: ['startups', 'fundraising', 'vc', 'entrepreneurship'],
    featuredImage: COVER_IMAGES[8],
    views: 3670,
  },
  {
    title: 'The Art of Saying No: Boundary Setting as a Superpower',
    excerpt: 'Every "yes" you say costs you a possible "no" somewhere else. After years of saying yes to everything, I learned that boundaries are not walls — they are foundations.',
    content: "I used to say yes to everything.\n\nEvery meeting request, every 'quick favor,' every 'can you just take a look at this?' I was the most helpful person in every room, and the least productive person in most of them.\n\nThe turning point came during a particularly brutal month when I realized I had not done a single day of meaningful creative work in four weeks. I had been incredibly busy, but I had built nothing.\n\n## The Opportunity Cost of Yes\n\nEvery 'yes' has a hidden price tag. When you say yes to a 30-minute coffee meeting, you are not just saying yes to 30 minutes. You are saying yes to:\n\n- Preparation time\n- Travel time\n- The context-switching cost afterward\n- The emotional energy of being 'on'\n\nThat 'quick' meeting often costs more than two hours of productive capacity.\n\n## Why Saying No Is Hard\n\nWe are socially conditioned to be agreeable. Saying no feels like rejection, like selfishness, like disappointment.\n\nBut here is the reframe: **every time you say yes to something that does not align with your priorities, you are saying no to something that does**.\n\nThe question is not whether you will say no. The question is what you will say no to.\n\n## The Warm No\n\nThe fear is that saying no will damage relationships. In practice, the opposite is usually true.\n\nA well-constructed no is more respectful than a reluctant yes. A reluctant yes leads to half-hearted effort, delayed delivery, and resentment.\n\nHow to say no warmly:\n\n1. **Acknowledge the request genuinely.** 'This sounds like a really interesting project.'\n2. **Be honest and simple.** 'I don't have the bandwidth to do this well right now.'\n3. **Close the door softly if possible.** 'If my situation changes, I will reach out.'\n\nYou do not need to explain, justify, or apologize at length. Brevity signals confidence.\n\n## What Became Possible\n\nAfter I learned to say no strategically, my output improved dramatically. Not because I was working more. Because I was working on the right things.\n\nThe people who respected me most responded positively to my boundaries. The people who responded poorly — who tried to guilt me or pressure me — those relationships revealed themselves as transactional.\n\nSaying no is a filter. Keep filtering until your yes means something.",
    categories: ['Productivity', 'Mindset'],
    tags: ['mindset', 'productivity', 'boundaries', 'selfimprovement'],
    featuredImage: COVER_IMAGES[5],
    views: 4250,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ MongoDB Connected for seeding');

    // Check if already seeded
    const existingBlogs = await BlogModel.find({ title: seedBlogs[0].title });
    if (existingBlogs.length > 0) {
      console.log('⚠️  Seed data already exists. Skipping...');
      console.log('   To re-seed, manually delete existing seed data from the database.');
      process.exit(0);
    }

    // Create users
    console.log('📝 Creating seed users...');
    const createdUsers: any[] = [];
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await UserModel.findOneAndUpdate(
        { email: userData.email },
        { ...userData, password: hashedPassword },
        { upsert: true, new: true }
      );
      createdUsers.push(user);
      console.log(`  ✓ User: ${user.username}`);
    }

    // Add some follow relationships
    await UserModel.findByIdAndUpdate(createdUsers[0]._id, {
      $addToSet: { followers: createdUsers[1]._id, following: createdUsers[2]._id },
    });
    await UserModel.findByIdAndUpdate(createdUsers[1]._id, {
      $addToSet: { followers: createdUsers[0]._id, following: createdUsers[2]._id },
    });

    // Create blogs, distributing among authors
    console.log('\n📚 Creating seed blogs...');
    for (let i = 0; i < seedBlogs.length; i++) {
      const blogData = seedBlogs[i];
      const author = createdUsers[i % createdUsers.length];

      // Add some likes from other users
      const randomLikes = createdUsers
        .filter((_, idx) => idx !== i % createdUsers.length)
        .slice(0, Math.floor(Math.random() * 4));

      const blog = new BlogModel({
        ...blogData,
        author: author._id,
        likes: randomLikes.map((u: any) => u._id),
        isPublished: true,
      });

      await blog.save();
      console.log(`  ✓ Blog: "${blogData.title.substring(0, 50)}..."`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`   ${seedUsers.length} users created`);
    console.log(`   ${seedBlogs.length} blogs created`);
    console.log('\n📋 Test Credentials (all passwords: Password123):');
    seedUsers.forEach(u => console.log(`   ${u.email} / Password123`));

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
