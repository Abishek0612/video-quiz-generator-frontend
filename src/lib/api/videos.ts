import { apiClient } from "./client";
import { Video } from "@/types";

export const videosApi = {
  upload: async (file: File, language?: string): Promise<Video> => {
    const formData = new FormData();
    formData.append("file", file);
    if (language) {
      formData.append("language", language);
    }

    const { data } = await apiClient.post("/videos/upload", formData, {
      // Don't set Content-Type - let axios handle it
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log("Upload progress:", percentCompleted);
      },
      timeout: 300000, // 5 minutes
    });
    return data;
  },

  getAll: async (): Promise<Video[]> => {
    const { data } = await apiClient.get("/videos");
    return data;
  },

  getById: async (id: string): Promise<Video> => {
    const { data } = await apiClient.get(`/videos/${id}`);
    return data;
  },

  getStatus: async (id: string) => {
    const { data } = await apiClient.get(`/videos/${id}/status`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/videos/${id}`);
  },
};
