import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadFile(file: File, setProgress?: (progress: number) => void): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const filePath = `${Date.now()}_${file.name}`; // Ensure unique filename
            
            // Upload file
            const { data, error } = await supabase.storage.from("meetings").upload(filePath, file, {
                cacheControl: "3600",
                upsert: false
            });

            if (error) {
                console.error("Upload error:", error);
                reject(error);
                return;
            }

            if (!data) {
                reject(new Error("No data returned from Supabase."));
                return;
            }

            const { data: publicUrlData } = supabase.storage.from("meetings").getPublicUrl(filePath);
            const publicUrl = publicUrlData.publicUrl;  

            resolve(publicUrl);
        } catch (error) {
            console.error("Unexpected error:", error);
            reject(error);
        }
    });
}