'use client';

import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/lib/supabase/client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/game/1`,
        },
      });

      if (error) {
        console.error('Error signing in:', error);
        setIsLoading(false);
      }
      // If successful, the user will be redirected to GitHub
    } catch (error) {
      console.error('Unexpected error:', error);
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white">
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
          <Link
            href="/"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Split Layout */}
      <div className="flex min-h-[calc(100vh-80px)] flex-col lg:flex-row">
        {/* Left Side - Branding/Info */}
        <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 px-8 py-16 lg:px-16">
          <div className="max-w-md space-y-8 text-center lg:text-left">
            {/* Large Robot Icon */}
            <div className="flex justify-center lg:justify-start">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/20">
                <Image
                  src="/codebot-assets/robot-default.svg"
                  alt="Robot"
                  width={80}
                  height={80}
                  className="h-20 w-20"
                />
              </div>
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-4xl font-bold text-white lg:text-5xl">
                Start Your
                <br />
                Coding Journey
              </h1>
            </div>

            {/* Benefits List */}
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/30">
                  <span className="text-sm font-bold text-white">✓</span>
                </div>
                <span className="text-lg text-white">150+ interactive coding challenges</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/30">
                  <span className="text-sm font-bold text-white">✓</span>
                </div>
                <span className="text-lg text-white">Real-time code execution</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/30">
                  <span className="text-sm font-bold text-white">✓</span>
                </div>
                <span className="text-lg text-white">Progress tracking & achievements</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/30">
                  <span className="text-sm font-bold text-white">✓</span>
                </div>
                <span className="text-lg text-white">Join 50,000+ learners</span>
              </li>
            </ul>

            {/* Decorative Code Snippet */}
            <div className="rounded-lg bg-slate-800/30 p-4 font-mono text-sm backdrop-blur-sm">
              <div className="text-purple-300">function</div>
              <div className="ml-4 text-blue-300">levelUp() {"{"}</div>
              <div className="ml-8 text-green-300">
                {"  "}robot.learn(
              </div>
              <div className="ml-12 text-yellow-300">{"    "}'JavaScript'</div>
              <div className="ml-12 text-green-300">);</div>
              <div className="ml-4 text-blue-300">{"}"}</div>
            </div>
          </div>
        </div>

        {/* Right Side - Authentication Form */}
        <div className="flex flex-1 items-center justify-center bg-white px-8 py-16 lg:px-16">
          <div className="w-full max-w-md">
            {/* Auth Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-3xl font-bold text-slate-800">Welcome!</h2>
                <p className="text-slate-600">
                  Sign in to continue your coding adventure
                </p>
              </div>

              {/* Divider */}
              <div className="mb-8 border-t border-gray-200"></div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-800">
                    Authentication failed. Please try again.
                  </p>
                </div>
              )}

              {/* GitHub OAuth Button */}
              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg bg-[#24292f] px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-[#1a1d23] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Image
                      src="/codebot-assets/github.svg"
                      alt="GitHub"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                    Continue with GitHub
                  </>
                )}
              </button>

              {/* Terms and Privacy */}
              <p className="mb-8 text-center text-xs text-slate-600">
                By continuing, you agree to our{" "}
                <Link href="#terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>

              {/* Why GitHub Section */}
              <div className="rounded-lg bg-slate-50 p-6">
                <h3 className="mb-4 text-center text-sm font-semibold text-slate-800">
                  Why GitHub?
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Secure authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Track your code commits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Sync your learning progress
                  </li>
                </ul>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Need help? Contact us at{" "}
                <a
                  href="mailto:support@codebot.com"
                  className="text-blue-600 hover:underline"
                >
                  support@codebot.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

