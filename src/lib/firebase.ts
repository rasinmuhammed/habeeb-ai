// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCTtHZGPCJfAGop-cwk3yTZCm064QP4oyQ",
    authDomain: "habeebai-34b0e.firebaseapp.com",
    projectId: "habeebai-34b0e",
    storageBucket: "habeebai-34b0e.firebasestorage.app",
    messagingSenderId: "440784072396",
    appId: "1:440784072396:web:ea4dcf40df549917fc5c69",
    measurementId: "G-MXGFCESYF4"
  };
  
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress?: (progress: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            // Create a reference to the file in Firebase Storage
            const storageRef = ref(storage, file.name);
            
            // Start the upload process
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Track the upload progress
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    if (setProgress) {
                        setProgress(progress);
                    }

                    switch (snapshot.state) {
                        case "paused":
                            console.log("Upload is paused");
                            break;
                        case "running":
                            console.log("Upload is running");
                            break;
                    }
                },
                (error) => {
                    console.error("Upload error:", error);
                    reject(error);
                },
                () => {
                    // Upload completed, get the file URL
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        } catch (error) {
            console.error("Unexpected error:", error);
            reject(error);
        }
    });
}