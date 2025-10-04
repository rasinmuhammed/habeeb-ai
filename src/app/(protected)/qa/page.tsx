'use client'
import React from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import AskQuestionCard from '../dashboard/ask-question-card'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from '../dashboard/code-references'
import { MessageSquare, Clock, User, Sparkles } from 'lucide-react'

const QAPage = () => {
    const { projectId } = useProject()
    const { data: questions, isLoading } = api.project.getQuestions.useQuery({ projectId })

    const [questionIndex, setQuestionIndex] = React.useState(0)
    const question = questions?.[questionIndex]

    return (
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white p-8'>
            <div className='max-w-6xl mx-auto'>
                {/* Header */}
                <div className='mb-8'>
                    <div className='flex items-center gap-3 mb-2'>
                        <div className='w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center'>
                            <MessageSquare className='h-5 w-5 text-white' />
                        </div>
                        <h1 className='text-3xl font-bold text-gray-900'>Q&A</h1>
                    </div>
                    <p className='text-gray-600'>Ask questions and view your saved conversations</p>
                </div>

                {/* Ask Question Card */}
                <div className='mb-8'>
                    <AskQuestionCard/>
                </div>

                {/* Saved Questions Section */}
                <div className='bg-white rounded-2xl border shadow-sm p-8'>
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-3'>
                            <Sparkles className='h-5 w-5 text-violet-600' />
                            <h2 className='text-xl font-bold text-gray-900'>Saved Questions</h2>
                        </div>
                        {questions && questions.length > 0 && (
                            <span className='px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium'>
                                {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                            </span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className='space-y-3'>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className='animate-pulse bg-gray-100 rounded-xl h-24' />
                            ))}
                        </div>
                    ) : questions && questions.length > 0 ? (
                        <Sheet>
                            <div className='space-y-3'>
                                {questions.map((q, index) => (
                                    <SheetTrigger 
                                        key={q.id} 
                                        onClick={() => setQuestionIndex(index)}
                                        className='w-full'
                                    >
                                        <div className='flex items-start gap-4 bg-gray-50 hover:bg-violet-50 rounded-xl p-5 border border-gray-200 hover:border-violet-300 transition-all hover:shadow-md text-left group'>
                                            <img 
                                                className='rounded-full ring-2 ring-gray-200 group-hover:ring-violet-300 transition-all' 
                                                height={40} 
                                                width={40} 
                                                src={q.user.imageUrl ?? ""} 
                                                alt='avatar'
                                            />
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex items-center gap-3 mb-2'>
                                                    <h3 className='text-gray-900 font-semibold text-base line-clamp-1 group-hover:text-violet-600 transition-colors'>
                                                        {q.question}
                                                    </h3>
                                                    <div className='flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap'>
                                                        <Clock className='h-3 w-3' />
                                                        {new Date(q.createdAt).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                                <p className='text-gray-600 text-sm line-clamp-2 leading-relaxed'>
                                                    {q.answer}
                                                </p>
                                                <div className='flex items-center gap-2 mt-3'>
                                                    <span className='px-2 py-1 bg-white rounded-md text-xs text-gray-600 border'>
                                                        {q.user.firstName} {q.user.lastName}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </SheetTrigger>
                                ))}
                            </div>

                            {question && (
                                <SheetContent className='sm:max-w-[90vw] lg:max-w-[80vw] overflow-y-auto'>
                                    <SheetHeader className='space-y-4 pb-6'>
                                        <div className='flex items-start gap-4'>
                                            <img 
                                                className='rounded-full ring-2 ring-violet-200' 
                                                height={48} 
                                                width={48} 
                                                src={question.user.imageUrl ?? ""} 
                                                alt='avatar'
                                            />
                                            <div className='flex-1'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <span className='text-sm font-medium text-gray-700'>
                                                        {question.user.firstName} {question.user.lastName}
                                                    </span>
                                                    <span className='text-xs text-gray-500'>•</span>
                                                    <span className='text-xs text-gray-500'>
                                                        {new Date(question.createdAt).toLocaleDateString('en-US', { 
                                                            month: 'long', 
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <SheetTitle className='text-2xl font-bold text-gray-900 leading-tight'>
                                                    {question.question}
                                                </SheetTitle>
                                            </div>
                                        </div>

                                        <div className='h-px bg-gray-200' />

                                        <div data-color-mode='light' className='prose prose-violet max-w-none'>
                                            <MDEditor.Markdown source={question.answer} />
                                        </div>

                                        {question.fileReferences && (question.fileReferences as any[]).length > 0 && (
                                            <>
                                                <div className='h-px bg-gray-200 mt-6' />
                                                <div>
                                                    <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                                                        <span className='w-1 h-5 bg-violet-600 rounded-full' />
                                                        Referenced Files
                                                    </h3>
                                                    <CodeReferences fileReferences={(question.fileReferences ?? []) as any}/>
                                                </div>
                                            </>
                                        )}
                                    </SheetHeader>
                                </SheetContent>
                            )}
                        </Sheet>
                    ) : (
                        <div className='text-center py-16'>
                            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <MessageSquare className='h-8 w-8 text-gray-400' />
                            </div>
                            <h3 className='text-lg font-semibold text-gray-900 mb-2'>No questions yet</h3>
                            <p className='text-gray-600 mb-6'>Start by asking a question about your codebase</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QAPage