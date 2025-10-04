'use client'
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import MeetingCard from "../dashboard/meeting-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { Presentation, Trash2, Eye, Clock, AlertCircle, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const MeetingsPage = () => {
    const { project, projectId } = useProject()
    const { data: meetings, isLoading } = api.project.getMeetings.useQuery({ projectId }, {
        refetchInterval: 4000
    })
    const deleteMeeting = api.project.deleteMeeting.useMutation()
    const refetch = useRefetch()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [meetingToDelete, setMeetingToDelete] = useState<{ id: string; name: string } | null>(null)

    const handleDeleteClick = (meeting: { id: string; name: string }) => {
        setMeetingToDelete(meeting)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (!meetingToDelete) return

        deleteMeeting.mutate({ meetingId: meetingToDelete.id }, {
            onSuccess: () => {
                toast.success('Meeting deleted successfully')
                refetch()
                setDeleteDialogOpen(false)
                setMeetingToDelete(null)
            },
            onError: () => {
                toast.error('Failed to delete meeting')
            }
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <Presentation className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
                    </div>
                    <p className="text-gray-600">Upload and analyze your team meetings with AI</p>
                </div>

                {/* Upload Card */}
                <div className="mb-8">
                    <MeetingCard />
                </div>

                {/* Meetings List */}
                <div className="bg-white rounded-2xl border shadow-sm p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Your Meetings</h2>
                            <p className="text-sm text-gray-600 mt-0.5">View and manage uploaded meetings</p>
                        </div>
                        {meetings && meetings.length > 0 && (
                            <Badge variant="outline" className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
                                {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'}
                            </Badge>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />
                            ))}
                        </div>
                    ) : meetings && meetings.length > 0 ? (
                        <div className="space-y-3">
                            {meetings.map(meeting => (
                                <div
                                    key={meeting.id}
                                    className="flex items-center justify-between p-5 bg-gray-50 hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Link
                                                href={`/meetings/${meeting.id}`}
                                                className="text-base font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-1"
                                            >
                                                {meeting.name}
                                            </Link>
                                            {meeting.status === 'PROCESSING' && (
                                                <Badge className="bg-yellow-500 text-white border-0 flex items-center gap-1">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    Processing...
                                                </Badge>
                                            )}
                                            {meeting.status === 'COMPLETED' && (
                                                <Badge className="bg-green-500 text-white border-0">
                                                    Completed
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4" />
                                                {new Date(meeting.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <AlertCircle className="h-4 w-4" />
                                                {meeting.issues.length} {meeting.issues.length === 1 ? 'issue' : 'issues'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Link href={`/meetings/${meeting.id}`}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteClick(meeting)}
                                            disabled={deleteMeeting.isPending}
                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Presentation className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings yet</h3>
                            <p className="text-gray-600">Upload your first meeting recording to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Meeting?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="pt-2">
                            Are you sure you want to delete <strong>{meetingToDelete?.name}</strong>?
                            <br /><br />
                            This action cannot be undone. All meeting data and issues will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleteMeeting.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMeeting.isPending ? 'Deleting...' : 'Delete Meeting'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default MeetingsPage