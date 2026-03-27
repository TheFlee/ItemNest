import api from "./axios";
import type { ItemImage } from "../types/post";

export async function getImagesByPost(itemPostId: string): Promise<ItemImage[]> {
  const response = await api.get<ItemImage[]>(`/itemposts/${itemPostId}/images`);
  return response.data;
}

export async function uploadImage(
  itemPostId: string,
  file: File
): Promise<ItemImage> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ItemImage>(
    `/itemposts/${itemPostId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function uploadImages(
  itemPostId: string,
  files: File[]
): Promise<ItemImage[]> {
  const uploadedImages: ItemImage[] = [];

  for (const file of files) {
    const image = await uploadImage(itemPostId, file);
    uploadedImages.push(image);
  }

  return uploadedImages;
}

export async function deleteImage(imageId: string): Promise<void> {
  await api.delete(`/itemimages/${imageId}`);
}