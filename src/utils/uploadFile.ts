export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Upload failed");
  }

  const { url } = await res.json();
  return url;
}
