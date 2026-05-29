"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Zap, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="HabeebAI" width={32} height={32} />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              HabeebAI
            </span>
          </Link>
          <Link
            href="/"
            className="text-gray-600 hover:text-violet-600 transition-colors font-medium flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left Side - Benefits (Hidden on mobile, shown on desktop) */}
            <div className="hidden lg:block space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold mb-4">
                  <Zap className="h-3.5 w-3.5" />
                  Why Choose HabeebAI?
                </div>
                <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Your AI-Powered<br />
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Code Companion
                  </span>
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Join thousands of developers who are shipping faster and understanding their codebases better.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-0.5">150 Free Credits</h3>
                    <p className="text-gray-600 text-sm">
                      Start exploring with generous free credits. No credit card required.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-0.5">5 Minute Setup</h3>
                    <p className="text-gray-600 text-sm">
                      Connect your GitHub repo and start asking questions immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-0.5">Enterprise-Grade AI</h3>
                    <p className="text-gray-600 text-sm">
                      Powered by the latest AI models for accurate, contextual answers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-5 text-white">
                <p className="text-sm text-violet-100 mb-1.5">Trusted by developers at</p>
                <p className="font-semibold text-base">
                  Startups • Scale-ups • Enterprises
                </p>
              </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border">
                {/* Mobile-only header */}
                <div className="text-center mb-6 lg:hidden">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold mb-3">
                    <Zap className="h-3.5 w-3.5" />
                    Get Started Free
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Start understanding your codebase today
                  </p>
                </div>

                <SignUp
                  routing="hash"
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow transition-all",
                      card: "shadow-none",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton: "border-2 hover:bg-gray-50 transition-colors hover:border-violet-200",
                      formFieldInput: "border-2 focus:border-violet-500 transition-colors",
                      footerActionLink: "text-violet-600 hover:text-violet-700 font-medium",
                      identityPreviewEditButton: "text-violet-600 hover:text-violet-700",
                      formFieldAction: "text-violet-600 hover:text-violet-700",
                      footer: "shadow-none",
                      formFieldLabel: "text-gray-700 font-medium"
                    }
                  }}
                  signInUrl="/"
                />
              </div>

              {/* Mobile-only benefits */}
              <div className="mt-6 lg:hidden space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">150 Free Credits</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-violet-500 flex-shrink-0" />
                  <span className="text-gray-700">5 Minute Setup</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-gray-700">Enterprise-Grade AI</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="HabeebAI" width={26} height={26} />
              <span className="font-semibold text-gray-800 text-sm">HabeebAI</span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">
              © 2025 HabeebAI. Powered by AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}