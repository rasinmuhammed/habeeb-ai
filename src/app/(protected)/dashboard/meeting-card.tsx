"use client";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "@/lib/supabase";
import { Presentation, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { api} from "@/trpc/react";
import useProject from "@/hooks/use-project";
import {toast} from 'sonner';
import { useRouter } from "next/navigation";
import axios from 'axios';
import { useMutation } from "@tanstack/react-query";

const MeetingCard = () => {
    const { project } = useProject()
    const processMeeting = useMutation({
        mutationFn: async (data : { meetingUrl: string; projectId: string; meetingId: string }) => {
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

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a'],
        },
        multiple: false,
        maxSize: 50_000_000, // 50MB limit
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
        <Card className="col-span-2 flex flex-col items-center justify-center p-10" {...getRootProps()}>
            {!isUploading && !fileUrl && (
                <>
                    <Presentation className="h-10 w-10 animate-bounce" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        Create a new meeting
                    </h3>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Analyse your Meeting with Habeeb AI.
                        <br />
                        Powered by AI.
                    </p>
                    <div className="mt-6">
                        <Button disabled={isUploading}>
                            <Upload className="ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Upload Meeting
                            <input className="hidden" {...getInputProps()} />
                        </Button>
                    </div>
                    {uploadError && <p className="mt-2 text-red-500 text-sm">{uploadError}</p>}
                </>
            )}
            {isUploading && (
                <div className="">
                    <CircularProgressbar value={progress} text={`${progress}%`} className='size-20' styles={
                        buildStyles({
                            pathColor: '#2563eb',
                            textColor: '#2563eb',
                        })
                    } />
                    <p className="text-sm text-gray-500 mt-2">Uploading your meeting...</p>
                </div>
            )}
            {fileUrl && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-green-600">Upload Successful!</p>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        Download File
                    </a>
                </div>
            )}
        </Card>
    );
};

export default MeetingCard;
