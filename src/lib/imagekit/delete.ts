import imagekit from "./server";

export async function deleteImageKitFile(fileId: string) {
  if (!fileId) {
    return;
  }

  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error("ImageKit delete failed:", error);
  }
}

export async function deleteImageKitFiles(fileIds: string[]) {
  const validIds = fileIds.filter(Boolean);

  for (const fileId of validIds) {
    await deleteImageKitFile(fileId);
  }
}