"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Zap, Users, Brain, CheckCircle, X } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
import { useState } from "react";

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="HabeebAI" width={32} height={32} />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              HabeebAI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">
              Features
            </Link>
            <Link href="#features" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">
              How it Works
            </Link>
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-violet-600"
              onClick={() => setShowSignIn(true)}
            >
              Sign In
            </Button>
            <Link href="/sign-up">
              <Button className="bg-violet-600 hover:bg-violet-700 shadow-md">
                Get Started
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link href="/sign-up">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Sign-In Modal */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to continue to HabeebAI</p>
              </div>
              <SignIn
                routing="hash"
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
                    card: "shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border-2 hover:bg-gray-50",
                    formFieldInput: "border-2 focus:border-violet-500",
                    footerActionLink: "text-violet-600 hover:text-violet-700"
                  }
                }}
                signUpUrl="/sign-up"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-6 shadow-sm">
          <Zap className="h-4 w-4" />
          AI-Powered Code Intelligence
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Understand Your Codebase<br />
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            in Minutes, Not Hours
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          HabeebAI helps you onboard faster, debug smarter, and collaborate better
          with AI-powered insights from your entire codebase.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/sign-up">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2 hover:border-violet-500 hover:bg-violet-50">
              See How it Works
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">150 Free Credits</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">5 Min Setup</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
            Everything You Need to Master Your Code
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make code understanding effortless
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Ask Questions
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Get instant, contextual answers about any part of your codebase.
              Like having a senior developer on call 24/7.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
              <Github className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Commit Analysis
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Automatic summaries of every commit. Understand what changed
              and why without reading through diffs.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Meeting Insights
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Upload team meetings and get AI-generated summaries with
              action items and key decisions highlighted.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See How it Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get up and running in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Connect Your Repository
              </h3>
              <p className="text-gray-600">
                Link your GitHub repository in seconds. No complex setup required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                AI Indexes Your Code
              </h3>
              <p className="text-gray-600">
                Our AI analyzes and understands your entire codebase automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Start Asking Questions
              </h3>
              <p className="text-gray-600">
                Get instant answers and insights about your code. That's it!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Development Workflow?
          </h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Join developers who are shipping faster with AI-powered code intelligence.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image src="/logo.png" alt="HabeebAI" width={30} height={30} />
              <span className="font-semibold text-primary">HabeebAI</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 HabeebAI. Powered by AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}