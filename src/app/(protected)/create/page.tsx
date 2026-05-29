'use client'
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import useRefetch from "@/hooks/use-refetch"
import { Info, AlertCircle, Github, Sparkles, Check, ArrowRight, Loader2, Zap, Shield, Code2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

type FormInput = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const features = [
    { icon: Zap, text: 'Instant Repository Analysis', color: 'text-yellow-500' },
    { icon: Code2, text: 'AI-Powered Code Insights', color: 'text-violet-500' },
    { icon: Shield, text: 'Secure & Private', color: 'text-green-500' },
]

const CreatePage = () => {
    const { register, handleSubmit, reset, watch } = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()
    const refetch = useRefetch()
    const router = useRouter()
    const [step, setStep] = useState<'input' | 'checking' | 'ready'>('input')

    const checkCredits = api.project.checkCredits.useMutation({
        onError: (error) => {
            toast.error(error.message || 'Failed to check repository. Please verify the URL and try again.')
            setStep('input')
        },
        onSuccess: () => {
            setStep('ready')
        }
    })

    const projectName = watch('projectName')
    const repoUrl = watch('repoUrl')

    function onSubmit(data: FormInput) {
        if (step === 'ready' && !!checkCredits.data) {
            createProject.mutate({
                githubUrl: data.repoUrl,
                name: data.projectName,
                githubToken: data.githubToken
            }, {
                onSuccess: () => {
                    toast.success('Project created successfully! 🎉')
                    refetch()
                    reset()
                    checkCredits.reset()
                    router.push('/dashboard')
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to create project')
                }
            })
        } else {
            setStep('checking')
            checkCredits.mutate({
                githubUrl: data.repoUrl,
                githubToken: data.githubToken
            })
        }
        return true
    }

    const hasEnoughCredits = checkCredits?.data?.userCredits
        ? checkCredits.data.fileCount <= checkCredits.data.userCredits
        : true

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="grid lg:grid-cols-2 gap-12 items-center"
                    >
                        {/* Left Side - Illustration & Features */}
                        <div className="hidden lg:flex flex-col items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="relative"
                            >
                                {/* Animated background glow */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.2, 0.3, 0.2]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full blur-3xl"
                                />
                                {/* Floating illustration */}
                                <motion.img
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    src='/undraw_github.svg'
                                    className="relative h-72 w-auto drop-shadow-2xl"
                                    alt="GitHub illustration"
                                />
                            </motion.div>

                            {/* Features list */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-10 space-y-4"
                            >
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center ${feature.color}`}>
                                            <feature.icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm font-medium">{feature.text}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right Side - Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="w-full"
                        >
                            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 lg:p-10 overflow-hidden relative">
                                {/* Decorative gradient */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />

                                <div className="relative">
                                    {/* Header */}
                                    <div className="mb-8">
                                        <motion.div
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-semibold mb-4"
                                        >
                                            <Github className="h-4 w-4" />
                                            New Project
                                        </motion.div>
                                        <h1 className="font-bold text-3xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-2">
                                            Link Your Repository
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Connect your GitHub repository to unlock AI-powered code intelligence
                                        </p>
                                    </div>

                                    {/* Step Indicator */}
                                    <div className="flex items-center gap-2 mb-8">
                                        {['Details', 'Verify', 'Create'].map((label, i) => (
                                            <React.Fragment key={label}>
                                                <div className={`flex items-center gap-2 ${(i === 0) || (i === 1 && step !== 'input') || (i === 2 && step === 'ready')
                                                        ? 'text-violet-600 dark:text-violet-400'
                                                        : 'text-gray-400'
                                                    }`}>
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${(i === 0) || (i === 1 && step !== 'input') || (i === 2 && step === 'ready')
                                                            ? 'bg-violet-600 text-white'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                                        }`}>
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-sm font-medium hidden sm:inline">{label}</span>
                                                </div>
                                                {i < 2 && <div className={`flex-1 h-0.5 ${(i === 0 && step !== 'input') || (i === 1 && step === 'ready')
                                                        ? 'bg-violet-600'
                                                        : 'bg-gray-200 dark:bg-gray-700'
                                                    }`} />}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Project Name
                                                </label>
                                                <Input
                                                    {...register('projectName', { required: true })}
                                                    placeholder='My Awesome Project'
                                                    className="h-12 border-2 rounded-xl focus:border-violet-500 dark:focus:border-violet-400 transition-colors dark:bg-gray-800 dark:border-gray-700"
                                                    required
                                                    disabled={step === 'ready'}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    GitHub Repository URL
                                                </label>
                                                <Input
                                                    {...register('repoUrl', { required: true })}
                                                    placeholder='https://github.com/username/repo'
                                                    type='url'
                                                    className="h-12 border-2 rounded-xl focus:border-violet-500 dark:focus:border-violet-400 transition-colors dark:bg-gray-800 dark:border-gray-700"
                                                    required
                                                    disabled={step === 'ready'}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    GitHub Token <span className="text-gray-400 font-normal">(Private repos only)</span>
                                                </label>
                                                <Input
                                                    {...register('githubToken')}
                                                    placeholder='ghp_xxxxxxxxxxxx'
                                                    type="password"
                                                    className="h-12 border-2 rounded-xl focus:border-violet-500 dark:focus:border-violet-400 transition-colors dark:bg-gray-800 dark:border-gray-700"
                                                    disabled={step === 'ready'}
                                                />
                                            </div>
                                        </div>

                                        {/* Credit Info */}
                                        <AnimatePresence mode="wait">
                                            {step === 'ready' && checkCredits.data && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className={`p-5 rounded-2xl border-2 ${hasEnoughCredits
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${hasEnoughCredits
                                                                    ? 'bg-green-100 dark:bg-green-800'
                                                                    : 'bg-red-100 dark:bg-red-800'
                                                                }`}
                                                        >
                                                            {hasEnoughCredits ? (
                                                                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                            ) : (
                                                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                            )}
                                                        </motion.div>
                                                        <div className="flex-1">
                                                            <p className={`text-base font-semibold ${hasEnoughCredits ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                                                                }`}>
                                                                {hasEnoughCredits
                                                                    ? 'Ready to create!'
                                                                    : 'Insufficient credits'}
                                                            </p>
                                                            <p className={`text-sm mt-1 ${hasEnoughCredits ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                                                }`}>
                                                                <strong>{checkCredits.data?.fileCount}</strong> files detected •
                                                                <strong> {checkCredits.data?.userCredits}</strong> credits available
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                disabled={createProject.isPending || checkCredits.isPending || (!hasEnoughCredits && !!checkCredits.data) || !projectName || !repoUrl}
                                                size="lg"
                                                className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-base font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all rounded-xl"
                                            >
                                                {createProject.isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Creating Project...
                                                    </>
                                                ) : checkCredits.isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Analyzing Repository...
                                                    </>
                                                ) : step === 'ready' ? (
                                                    <>
                                                        <Sparkles className="mr-2 h-5 w-5" />
                                                        Create Project
                                                    </>
                                                ) : (
                                                    <>
                                                        Continue
                                                        <ArrowRight className="ml-2 h-5 w-5" />
                                                    </>
                                                )}
                                            </Button>

                                            {step === 'ready' && (
                                                <motion.button
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    type="button"
                                                    onClick={() => {
                                                        setStep('input')
                                                        checkCredits.reset()
                                                    }}
                                                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                                >
                                                    ← Change repository
                                                </motion.button>
                                            )}
                                        </div>
                                    </form>

                                    {/* Help Text */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Info className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Each file costs <strong className="text-gray-900 dark:text-white">1 credit</strong> to analyze.
                                                Your project will be indexed in the background after creation.
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default CreatePage