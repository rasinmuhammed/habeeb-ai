'use client'
import React from "react"
import { useForm } from "react-hook-form"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import useRefetch from "@/hooks/use-refetch"
import { Info, AlertCircle, Github, Sparkles, Check } from "lucide-react"

type FormInput = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()
    const refetch = useRefetch()
    const checkCredits = api.project.checkCredits.useMutation({
        onError: (error) => {
            toast.error(error.message || 'Failed to check repository. Please verify the URL and try again.')
        }
    })

    function onSubmit(data: FormInput) {
        if (!!checkCredits.data) {
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
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to create project')
                }
            })
        } else {
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Side - Illustration */}
                        <div className="hidden lg:flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full blur-3xl opacity-20"></div>
                                <img 
                                    src='/undraw_github.svg' 
                                    className="relative h-80 w-auto drop-shadow-2xl" 
                                    alt="GitHub illustration"
                                /> 
                            </div>
                            <div className="mt-8 text-center space-y-3">
                                <div className="flex items-center justify-center gap-2 text-gray-700">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-medium">Instant Repository Analysis</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-gray-700">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-medium">AI-Powered Insights</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-gray-700">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-medium">Smart Credit System</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="w-full">
                            <div className="bg-white rounded-2xl shadow-xl border p-8 lg:p-10">
                                <div className="mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-4">
                                        <Github className="h-4 w-4" />
                                        New Project
                                    </div>
                                    <h1 className="font-bold text-3xl text-gray-900 mb-2">
                                        Link Your Repository
                                    </h1>
                                    <p className="text-gray-600">
                                        Connect your GitHub repository to unlock AI-powered code intelligence
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Name
                                        </label>
                                        <Input
                                            {...register('projectName', { required: true })}
                                            placeholder='My Awesome Project'
                                            className="border-2 focus:border-violet-500 transition-colors"
                                            required 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            GitHub Repository URL
                                        </label>
                                        <Input
                                            {...register('repoUrl', { required: true })}
                                            placeholder='https://github.com/username/repo'
                                            type='url'
                                            className="border-2 focus:border-violet-500 transition-colors"
                                            required 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            GitHub Token <span className="text-gray-400 font-normal">(Optional)</span>
                                        </label>
                                        <Input
                                            {...register('githubToken')}
                                            placeholder='ghp_xxxxxxxxxxxx'
                                            type="password"
                                            className="border-2 focus:border-violet-500 transition-colors"
                                        />
                                        <p className="text-xs text-gray-500 mt-1.5">
                                            Required for private repositories only
                                        </p>
                                    </div>

                                    {/* Credit Info */}
                                    {!!checkCredits.data && (
                                        <div className={`p-4 rounded-xl border-2 ${
                                            hasEnoughCredits 
                                                ? 'bg-green-50 border-green-200' 
                                                : 'bg-red-50 border-red-200'
                                        }`}>
                                            <div className="flex items-start gap-3">
                                                {hasEnoughCredits ? (
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <Sparkles className="h-4 w-4 text-green-600" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${
                                                        hasEnoughCredits ? 'text-green-900' : 'text-red-900'
                                                    }`}>
                                                        {hasEnoughCredits 
                                                            ? 'You have enough credits!' 
                                                            : 'Insufficient credits'}
                                                    </p>
                                                    <p className={`text-sm mt-1 ${
                                                        hasEnoughCredits ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        This repository requires <strong>{checkCredits.data?.fileCount}</strong> credits.
                                                        You have <strong>{checkCredits.data?.userCredits}</strong> credits remaining.
                                                    </p>
                                                    {!hasEnoughCredits && (
                                                        <p className="text-xs text-red-600 mt-2">
                                                            Please purchase more credits to continue.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <Button 
                                            type="submit" 
                                            disabled={createProject.isPending || checkCredits.isPending || (!hasEnoughCredits && !!checkCredits.data)}
                                            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                                        >
                                            {createProject.isPending ? (
                                                <>
                                                    <span className="animate-spin mr-2">⚙️</span>
                                                    Creating Project...
                                                </>
                                            ) : checkCredits.isPending ? (
                                                <>
                                                    <span className="animate-spin mr-2">🔍</span>
                                                    Checking Repository...
                                                </>
                                            ) : !!checkCredits.data ? (
                                                'Create Project'
                                            ) : (
                                                'Check Credits'
                                            )}
                                        </Button>
                                    </div>
                                </form>

                                {/* Help Text */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-gray-600">
                                            Credits are used based on the number of files in your repository. 
                                            Each file costs 1 credit to index and analyze.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreatePage