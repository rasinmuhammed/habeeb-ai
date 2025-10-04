"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "@/utils/uploadFile";
import { Presentation, Upload, CheckCircle, AlertCircle, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from 'sonner';
import { useRouter } from "next/navigation";
import axios from 'axios';
import { useMutation } from "@tanstack/react-query";

const MeetingCard = () => {
    const { project } = useProject()
    const processMeeting = useMutation({
        mutationFn: async (data: { meetingUrl: string; projectId: string; meetingId: string }) => {
            const { meetingUrl, projectId, meetingId } = data;
            const response = await axios.post('/api/process-meeting', { meetingUrl, projectId, meetingId });
            return response.data;
        }
    });
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const router = useRouter()
    const [uploadError, setUploadError] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const uploadMeeting = api.project.uploadMeeting.useMutation()

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a'],
        },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async (acceptedFiles) => {
            if (!project) return;
            if (!acceptedFiles.length) return;

            setIsUploading(true);
            setUploadError("");
            setProgress(0);

            const file = acceptedFiles[0] as File;

            try {
                const downloadURL = await uploadFile(file, setProgress);
                setFileUrl(downloadURL);

                await uploadMeeting.mutateAsync(
                    { projectId: project.id, meetingUrl: downloadURL, name: file.name },
                    {
                        onSuccess: async (meeting) => {
                            toast.success("Meeting Uploaded Successfully!");

                            try {
                                await processMeeting.mutateAsync({
                                    meetingUrl: downloadURL,
                                    meetingId: meeting.id,
                                    projectId: project.id,
                                });

                                router.push("/meetings");
                            } catch (error) {
                                console.error("Processing error:", error);
                                toast.error("Meeting processing failed.");
                            }
                        },
                        onError: () => {
                            toast.error("Failed to upload Meeting");
                        },
                    }
                );
            } catch (error) {
                console.error("Upload failed:", error);
                setUploadError("Upload failed. Please try again.");
            } finally {
                setIsUploading(false);
            }
        }
    });

    return (
        <Card className="relative border-2 border-gray-200 hover:border-violet-300 transition-all shadow-sm hover:shadow-md overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Presentation className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Upload Meeting</h3>
                        <p className="text-sm text-gray-600">Get AI-powered meeting summaries</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                        isDragActive
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'
                    }`}
                >
                    <input {...getInputProps()} />

                    {!isUploading && !fileUrl && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileAudio className="h-8 w-8 text-purple-600" />
                            </div>
                            <h4 className="text-base font-semibold text-gray-900 mb-2">
                                {isDragActive ? 'Drop your file here' : 'Upload Meeting Recording'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Drag and drop or click to browse
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
                                <span>Supported: MP3, WAV, M4A</span>
                                <span>•</span>
                                <span>Max 50MB</span>
                            </div>
                            <Button 
                                type="button"
                                disabled={isUploading}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Choose File
                            </Button>
                            {uploadError && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    {uploadError}
                                </div>
                            )}
                        </div>
                    )}

                    {isUploading && (
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-4">
                                <CircularProgressbar
                                    value={progress}
                                    text={`${progress}%`}
                                    styles={buildStyles({
                                        pathColor: '#9333ea',
                                        textColor: '#9333ea',
                                        trailColor: '#f3e8ff',
                                    })}
                                />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Uploading your meeting...</p>
                            <p className="text-xs text-gray-500 mt-1">This may take a moment</p>
                        </div>
                    )}

                    {fileUrl && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h4 className="text-base font-semibold text-green-900 mb-2">
                                Upload Successful!
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Your meeting is being processed...
                            </p>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-violet-600 hover:text-violet-700 underline"
                            >
                                View uploaded file
                            </a>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default MeetingCard;