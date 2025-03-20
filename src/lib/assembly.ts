import {AssemblyAI} from 'assemblyai';
import { start } from 'repl';

const client = new AssemblyAI({apiKey: process.env.ASSEMBLYAI_API_KEY as string});

function msToTime(ms: number) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export const processMeeting = async (meetingUrl: string) => {
    const transcript = await client.transcripts.transcribe({
        audio: meetingUrl,
        auto_chapters: true,
    })

    const summaries = transcript.chapters?.map((chapter) => ({
        start: msToTime(chapter.start),
        end: msToTime(chapter.end),
        gist: chapter.gist,
        headline: chapter.headline,
        summary: chapter.summary,
    })) || [];
    if (!transcript.text) throw new Error('No transcript found');
    return {
        summaries
    }
}

