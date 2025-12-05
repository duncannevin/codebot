import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/codebot-assets/logo-icon.svg"
              alt="Code Bot Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-blue-600">Code Bot</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            Start Learning
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight text-slate-800">
              Learn JavaScript
              <br />
              by Coding a
              <br />
              <span className="text-blue-600">Robot Through Mazes</span>
            </h1>
            <p className="text-lg text-slate-600">
              Master JavaScript fundamentals through interactive coding challenges. Write real code
              to guide your robot to victory!
            </p>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-700"
              >
                Start Free Trial
              </Link>
              <button className="rounded-lg border-2 border-blue-600 px-8 py-3 font-bold text-blue-600 transition-colors hover:bg-blue-50">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Maze Demo */}
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-8">
              <div className="grid grid-cols-5 gap-2">
                {/* Row 1 */}
                <div className="flex h-16 w-16 items-center justify-center rounded bg-green-500">
                  <Image
                    src="/codebot-assets/robot-default.svg"
                    alt="Robot"
                    width={48}
                    height={48}
                    className="h-12 w-12"
                  />
                </div>
                <div className="h-16 w-16 rounded bg-gray-100"></div>
                <Image
                  src="/codebot-assets/wall.svg"
                  alt="Wall"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded"
                />
                <div className="h-16 w-16 rounded bg-gray-100"></div>
                <div className="h-16 w-16 rounded bg-gray-100"></div>

                {/* Row 2 */}
                <div className="h-16 w-16 rounded bg-gray-100"></div>
                <Image
                  src="/codebot-assets/wall.svg"
                  alt="Wall"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded"
                />
                <div className="h-16 w-16 rounded bg-gray-100"></div>
                <Image
                  src="/codebot-assets/wall.svg"
                  alt="Wall"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded"
                />
                <div className="h-16 w-16 rounded bg-gray-100"></div>

                {/* Row 3 */}
                <div className="h-16 w-16 rounded bg-gray-100"></div>
                <div className="h-16 w-16 rounded bg-gray-100"></div>
                <div className="h-16 w-16 rounded bg-gray-100"></div>
                <div className="h-16 w-16 rounded bg-gray-100"></div>
                <div className="flex h-16 w-16 items-center justify-center rounded bg-amber-500">
                  <Image
                    src="/codebot-assets/goal.svg"
                    alt="Goal"
                    width={48}
                    height={48}
                    className="h-12 w-12"
                  />
                </div>
              </div>

              {/* Code Snippet */}
              <div className="mt-6 rounded-lg bg-slate-800 p-4 font-mono text-sm">
                <div className="text-purple-400">function</div>
                <div className="ml-4 text-blue-400">solveMaze() {"{"}</div>
                <div className="ml-8 text-green-400">robot.moveRight();</div>
                <div className="ml-8 text-green-400">robot.moveDown();</div>
                <div className="ml-4 text-blue-400">{"}"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-16 text-center text-4xl font-bold text-slate-800">
            Why Code Bot?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-800">Learn by Playing</h3>
              <p className="text-slate-600">
                Turn coding into an adventure. Solve puzzles and complete challenges while learning
                JavaScript fundamentals.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-800">Instant Feedback</h3>
              <p className="text-slate-600">
                See your code run in real-time. Watch your robot navigate through mazes as you learn
                from mistakes instantly.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-800">Progressive Learning</h3>
              <p className="text-slate-600">
                Start simple, level up gradually. From basic movements to complex algorithms, master
                JavaScript at your own pace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-16 text-center text-4xl font-bold text-slate-800">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-800">Choose a Level</h3>
              <p className="text-sm text-slate-600">Select from 100+ progressive mazes</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-800">Write Code</h3>
              <p className="text-sm text-slate-600">Use JavaScript to control your robot</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-800">Run & Debug</h3>
              <p className="text-sm text-slate-600">Watch it execute and fix errors</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-800">Level Up</h3>
              <p className="text-sm text-slate-600">Unlock harder challenges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-16 text-center text-4xl font-bold text-slate-800">
            Your Learning Journey
          </h2>
          <div className="mb-12 flex flex-col items-center justify-center gap-8 md:flex-row">
            <div className="w-full rounded-lg border-2 border-gray-200 bg-white p-6 text-center md:w-48">
              <h3 className="mb-3 text-lg font-bold text-slate-800">Beginner</h3>
              <p className="text-sm text-slate-600">Variables & Functions</p>
              <p className="text-sm text-slate-600">Basic Movement</p>
              <p className="text-sm text-slate-600">Simple Logic</p>
            </div>
            <div className="hidden text-blue-600 md:block">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                <path d="M0 10 L30 10 M30 10 L20 0 M30 10 L20 20" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <div className="w-full rounded-lg border-2 border-gray-200 bg-white p-6 text-center md:w-48">
              <h3 className="mb-3 text-lg font-bold text-slate-800">Intermediate</h3>
              <p className="text-sm text-slate-600">Loops & Conditions</p>
              <p className="text-sm text-slate-600">Arrays & Objects</p>
              <p className="text-sm text-slate-600">Complex Patterns</p>
            </div>
            <div className="hidden text-blue-600 md:block">
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                <path d="M0 10 L30 10 M30 10 L20 0 M30 10 L20 20" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <div className="w-full rounded-lg border-2 border-gray-200 bg-white p-6 text-center md:w-48">
              <h3 className="mb-3 text-lg font-bold text-slate-800">Advanced</h3>
              <p className="text-sm text-slate-600">Algorithms</p>
              <p className="text-sm text-slate-600">Recursion</p>
              <p className="text-sm text-slate-600">Optimization</p>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-lg border-2 border-gray-200 bg-white p-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-blue-600">150+</div>
                <div className="text-sm text-slate-600">Coding Challenges</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-slate-600">Students Learning</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-blue-600">4.9★</div>
                <div className="text-sm text-slate-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-16 text-center text-4xl font-bold text-slate-800">
            What Students Say
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4">
                <Image
                  src="/codebot-assets/stars-5.svg"
                  alt="5 stars"
                  width={120}
                  height={24}
                  className="h-6"
                />
              </div>
              <p className="mb-4 text-sm text-slate-600">
                "Finally, coding that doesn't feel like homework! The mazes make learning JavaScript
                actually fun."
              </p>
              <p className="text-sm font-bold text-slate-800">- Sarah M., Student</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4">
                <Image
                  src="/codebot-assets/stars-5.svg"
                  alt="5 stars"
                  width={120}
                  height={24}
                  className="h-6"
                />
              </div>
              <p className="mb-4 text-sm text-slate-600">
                "Went from zero coding knowledge to building my own projects in just 3 months.
                Highly recommend!"
              </p>
              <p className="text-sm font-bold text-slate-800">- Jake P., Career Switcher</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4">
                <Image
                  src="/codebot-assets/stars-5.svg"
                  alt="5 stars"
                  width={120}
                  height={24}
                  className="h-6"
                />
              </div>
              <p className="mb-4 text-sm text-slate-600">
                "The progressive difficulty keeps me challenged without being overwhelming. Love this
                platform!"
              </p>
              <p className="text-sm font-bold text-slate-800">- Maria L., Developer</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-800 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">Ready to Start Your</h2>
          <h2 className="mb-8 text-4xl font-bold text-white">Coding Journey?</h2>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-blue-700"
          >
            Start Free Trial - No Credit Card
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="mb-4 font-bold">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="hover:text-white">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
            © 2024 Code Bot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
