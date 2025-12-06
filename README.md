# 🤖 Code Bot - Learn JavaScript by Coding a Robot Through Mazes

**Live Demo:** [https://codebot-blush.vercel.app](https://codebot-blush.vercel.app)

An interactive coding game where you learn JavaScript fundamentals by writing real code to guide a robot through mazes. Master loops, conditionals, functions, and more through hands-on challenges!

![Code Bot Identicon](./public/identicon.svg)

## 🎮 How to Play

### Getting Started

1. **Visit the game**: Go to [https://codebot-blush.vercel.app](https://codebot-blush.vercel.app)
2. **Sign in**: Click "Continue with GitHub" to authenticate
3. **Start coding**: You'll be taken to your current level where you can start solving mazes!

### Gameplay Basics

1. **Read the Objective**: Each level has a clear goal - usually to guide the robot (🤖) to the goal (🎯)
2. **Write Your Code**: Use the code editor to write JavaScript that controls the robot
3. **Run Your Code**: Click "Run Code" to execute your solution
4. **Watch the Robot**: See your robot move through the maze in real-time
5. **Complete the Level**: Reach the goal to unlock the next level!

### Robot API

Control your robot using these functions:

```javascript
// Movement functions
await robot.moveUp()      // Move robot up one cell
await robot.moveDown()    // Move robot down one cell
await robot.moveLeft()    // Move robot left one cell
await robot.moveRight()   // Move robot right one cell

// Sensing functions
robot.canMove(direction)  // Check if robot can move in a direction ('up', 'down', 'left', 'right')
robot.isWall(direction)   // Check if there's a wall in a direction
robot.atGoal()            // Check if robot has reached the goal
```

**Important**: Always use `await` before movement functions! This ensures the robot moves one step at a time.

### Example Solution

Here's how you might solve a simple level:

```javascript
function solveMaze() {
    // Move right twice to reach the goal
    await robot.moveRight();
    await robot.moveRight();
}

solveMaze();
```

### Level Progression

- **Level 1-3**: Basic movement and navigation
- **Level 4-6**: Loops (`for` and `while`) to repeat actions
- **Level 7-8**: Conditionals (`if/else`) and custom functions
- **Level 9-10**: Advanced concepts combining all techniques

Each level builds on previous concepts, so complete them in order!

### Tips for Success

- **Read the hints**: Each level includes helpful hints if you get stuck
- **Check the requirements**: Some levels require specific techniques (loops, conditionals, etc.)
- **Use the console**: Check the console output for error messages
- **Start simple**: Break complex problems into smaller steps
- **Experiment**: Try different approaches and see what works!

## ✨ Features

- 🎯 **10 Progressive Levels**: From basic movement to advanced programming concepts
- 💻 **Real Code Execution**: Write actual JavaScript that runs in a sandboxed environment
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- 📊 **Progress Tracking**: Your progress is saved automatically
- ⭐ **Statistics**: Track your moves, time, and best scores for each level
- 🔒 **Secure**: Server-side code execution ensures safety
- 🚀 **Fast**: Optimized for performance with Next.js and Vercel

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with GitHub OAuth
- **Code Editor**: Monaco Editor (VS Code editor)
- **Deployment**: Vercel
- **Real-time**: WebSocket support (development) / HTTP polling (production)

## 📦 Project Structure

```
codebot/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   ├── game/               # Game pages
│   └── layout.tsx         # Root layout
├── components/             # React components
│   └── game/               # Game-specific components
├── lib/                    # Utility functions
│   ├── game/               # Game logic (executor, parser, robot)
│   ├── db/                 # Database helpers
│   └── supabase/           # Supabase client setup
├── data/                   # Game data
│   └── levels/             # Level definitions (Markdown)
├── public/                 # Static assets
└── types/                  # TypeScript type definitions
```

## 🚀 Getting Started (Development)

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up free](https://app.supabase.com))
- A GitHub account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd codebot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [Supabase](https://app.supabase.com)
   - Run the migration in `supabase/migrations/001_create_user_progress.sql`
   - Get your project URL and anon key from Settings > API

4. **Configure GitHub OAuth**
   - Create a new OAuth app in [GitHub Settings](https://github.com/settings/developers)
   - Set callback URL: `http://localhost:3000/auth/callback` (for local)
   - Enable GitHub provider in Supabase Authentication settings
   - Add your Client ID and Client Secret

5. **Create environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Scripts

```bash
npm run dev          # Start Next.js dev server (HTTP mode)
npm run dev:ws       # Start with WebSocket server (real-time updates)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📚 How It Works

### Code Execution

1. User writes JavaScript code in the Monaco Editor
2. Code is sent to `/api/game/execute` API route
3. Server executes code in a sandboxed environment using `CodeExecutor`
4. Robot movements are validated against the maze
5. Execution events (robot moves, errors) are returned
6. Frontend visualizes the robot movement frame by frame

### Level System

- Levels are defined in Markdown files (`data/levels/level-*.md`)
- Each level includes: objective, gameboard, tips, hints, boilerplate, and requirements
- User progress is tracked in Supabase (`user_progress` table)
- Players can revisit completed levels but must complete them in order

### Security

- All code execution happens server-side
- User code is sandboxed using `new Function()` (consider `vm2` for production)
- Robot movements are validated against maze boundaries and walls
- No direct file system or network access

## 🎓 Learning Path

The game teaches JavaScript concepts progressively:

1. **Basic Movement** (Levels 1-3)
   - Function calls
   - Sequential execution
   - Basic navigation

2. **Loops** (Levels 4-6)
   - `for` loops
   - `while` loops
   - Repeating actions

3. **Conditionals** (Level 7)
   - `if/else` statements
   - Decision making
   - Using `canMove()` and `isWall()`

4. **Functions** (Level 8)
   - Custom function definitions
   - Code organization
   - Reusability

5. **Advanced** (Levels 9-10)
   - Combining all concepts
   - Complex problem solving
   - Optimization

## 🐛 Troubleshooting

### Game Issues

- **Robot not moving**: Check console for errors, ensure you're using `await` before movement functions
- **Can't progress**: Make sure you've completed the current level and met all requirements
- **Code not running**: Verify your JavaScript syntax is correct

### Development Issues

- **WebSocket not connecting**: This is normal in production - the app falls back to HTTP polling automatically
- **Authentication errors**: Verify your GitHub OAuth callback URL matches Supabase settings
- **Database errors**: Ensure migrations have been run in Supabase

## 📝 Contributing

Contributions are welcome! Areas for improvement:

- New levels and challenges
- Additional robot functions
- UI/UX improvements
- Performance optimizations
- Documentation improvements

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- **Live Game**: [https://codebot-blush.vercel.app](https://codebot-blush.vercel.app)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend as a service
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Vercel](https://vercel.com) - Deployment platform

---

**Happy Coding! 🚀**
