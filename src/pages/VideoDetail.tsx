import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { videosApi } from "@/lib/api/videos";
import { questionsApi } from "@/lib/api/questions";
import { TranscriptViewer } from "@/components/transcript/TranscriptViewer";
import { QuestionList } from "@/components/questions/QuestionList";
import { ProcessingStatus } from "@/components/video/ProcessingStatus";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: video, isLoading: videoLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: () => videosApi.getById(id!),
    enabled: !!id,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["questions", id],
    queryFn: () => questionsApi.getByVideoId(id!),
    enabled: !!id && video?.status === "completed",
  });

  if (videoLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!video) {
    return <div>Video not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{video.originalName}</h1>
            <p className="text-muted-foreground mt-1">
              Uploaded {new Date(video.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {video.status === "completed" && (
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Questions
          </Button>
        )}
      </div>

      {video.status !== "completed" ? (
        <ProcessingStatus video={video} />
      ) : (
        <Tabs defaultValue="transcript" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="transcript" className="mt-6">
            <TranscriptViewer video={video} />
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <QuestionList
              questions={questions || []}
              isLoading={questionsLoading}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
