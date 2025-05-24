import { apiClient } from "./client";
import { Question } from "@/types";

export const questionsApi = {
  getByVideoId: async (videoId: string): Promise<Question[]> => {
    const { data } = await apiClient.get(`/questions/video/${videoId}`);
    return data;
  },

  update: async (id: string, payload: Partial<Question>): Promise<Question> => {
    const { data } = await apiClient.patch(`/questions/${id}`, payload);
    return data;
  },

  export: async (
    videoId: string,
    format: "json" | "csv" | "moodle" = "json"
  ) => {
    const { data } = await apiClient.get(`/questions/video/${videoId}/export`, {
      params: { format },
      responseType: format === "json" ? "json" : "blob",
    });
    return data;
  },
};
