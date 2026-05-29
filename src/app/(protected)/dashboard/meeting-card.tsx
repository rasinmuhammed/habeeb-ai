"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "@/utils/uploadFile";
import { Presentation, Upload, CheckCircle, AlertCircle, FileAudio, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from 'sonner';
import { useRouter } from "next/navigation";
import axios from 'axios';
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

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
                const downloadURL = await uploadFile(file);
                setProgress(100); // Set to 100 when upload completes
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
        <Card className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden group">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />

            <CardHeader className="pb-4 relative">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Presentation className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload Meeting</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Get AI-powered meeting summaries</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative">
                <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${isDragActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                >
                    <input {...getInputProps()} />

                    <AnimatePresence mode="wait">
                        {!isUploading && !fileUrl && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center"
                            >
                                <motion.div
                                    animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                >
                                    <FileAudio className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </motion.div>
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                                    {isDragActive ? 'Drop your file here' : 'Upload Meeting Recording'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Drag and drop or click to browse
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">MP3</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">WAV</span>
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">M4A</span>
                                    <span className="text-gray-400">•</span>
                                    <span>Max 50MB</span>
                                </div>
                                <Button
                                    type="button"
                                    disabled={isUploading}
                                    size="lg"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all rounded-xl"
                                >
                                    <Upload className="mr-2 h-5 w-5" />
                                    Choose File
                                </Button>
                                {uploadError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        {uploadError}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {isUploading && (
                            <motion.div
                                key="uploading"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center py-4"
                            >
                                <div className="w-24 h-24 mx-auto mb-4">
                                    <CircularProgressbar
                                        value={progress}
                                        text={`${progress}%`}
                                        styles={buildStyles({
                                            pathColor: '#9333ea',
                                            textColor: '#9333ea',
                                            trailColor: '#f3e8ff',
                                            pathTransitionDuration: 0.3,
                                        })}
                                    />
                                </div>
                                <p className="text-base font-semibold text-gray-900 dark:text-white">Uploading your meeting...</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This may take a moment</p>
                            </motion.div>
                        )}

                        {fileUrl && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center py-4"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                    className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </motion.div>
                                <h4 className="text-base font-semibold text-green-900 dark:text-green-100 mb-2">
                                    Upload Successful!
                                </h4>
                                <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 mb-4">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm font-medium">Processing your meeting...</span>
                                </div>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline transition-colors"
                                >
                                    View uploaded file
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};

export default MeetingCard;