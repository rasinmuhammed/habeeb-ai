"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Zap, Users, Brain, CheckCircle, Code2, Sparkles, X } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
import { useState } from "react";

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="HabeebAI" width={32} height={32} className="transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              HabeebAI
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">
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
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                Get Started
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSignIn(true)}
            >
              Sign In
            </Button>
            <Link href="/sign-up">
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Sign-In Modal */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in slide-in-from-bottom duration-300">
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10 hover:bg-gray-100 rounded-full p-1"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to continue to HabeebAI</p>
              </div>
              <SignIn
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
                    card: "shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border-2 hover:bg-gray-50 transition-colors",
                    formFieldInput: "border-2 focus:border-violet-500 transition-colors",
                    footerActionLink: "text-violet-600 hover:text-violet-700 font-medium"
                  }
                }}
                redirectUrl="/sync-user"
                signUpUrl="/sign-up"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-28 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 rounded-full text-sm font-semibold mb-6 shadow-sm border border-violet-200/50">
            <Zap className="h-4 w-4" />
            AI-Powered Code Intelligence
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Understand Your Codebase<br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              in Minutes, Not Hours
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            HabeebAI helps you onboard faster, debug smarter, and collaborate better
            with AI-powered insights from your entire codebase.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all group">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2 border-violet-200 hover:border-violet-500 hover:bg-violet-50 transition-all">
                See How it Works
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">150 Free Credits</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">5 Min Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-white rounded-3xl -mt-12 shadow-2xl border relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 rounded-full text-sm font-medium mb-4 border border-violet-200/50">
            Everything You Need to Master Your Code
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Developers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered tools designed to make code understanding effortless
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group bg-gradient-to-br from-violet-50 to-white p-8 rounded-2xl border-2 border-violet-100 hover:border-violet-300 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
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

          <div className="group bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
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

          <div className="group bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-100 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
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
      <section id="how-it-works" className="bg-gradient-to-b from-gray-50 to-white py-24 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 rounded-full text-sm font-medium mb-4 border border-violet-200/50">
              Simple & Fast
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No complex setup. Start understanding your codebase in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="relative mb-6 inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Connect Your Repository
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Link your GitHub repository in seconds. No complex setup or configuration required.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6 inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                AI Indexes Your Code
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI analyzes and understands your entire codebase automatically using advanced embeddings.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6 inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Start Asking Questions
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant answers and insights about your code. That's it! Simple and powerful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Development Workflow?
            </h2>
            <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are shipping faster with AI-powered code intelligence.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="mt-6 text-violet-200 text-sm">
              No credit card required • 150 free credits • 5 minute setup
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="HabeebAI" width={32} height={32} />
                <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">HabeebAI</span>
              </div>
              <p className="text-gray-600 max-w-sm">
                AI-powered code intelligence platform helping developers understand and ship better code faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 hover:text-violet-600 transition-colors">Features</Link></li>
                <li><Link href="/sign-up" className="text-gray-600 hover:text-violet-600 transition-colors">Pricing</Link></li>
                <li><Link href="#how-it-works" className="text-gray-600 hover:text-violet-600 transition-colors">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/sign-up" className="text-gray-600 hover:text-violet-600 transition-colors">Get Started</Link></li>
                <li><button onClick={() => setShowSignIn(true)} className="text-gray-600 hover:text-violet-600 transition-colors">Sign In</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-600 text-sm">
                © 2025 HabeebAI. Powered by AI.
              </p>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span className="text-sm text-gray-500">Built with ❤️ using Groq & Gemini</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}
      </style>
    </div>
  );
}