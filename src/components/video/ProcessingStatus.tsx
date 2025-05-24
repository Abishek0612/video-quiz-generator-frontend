import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Video, ProcessingStatus as Status } from "@/types";
import { videosApi } from "@/lib/api/videos";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProcessingStatusProps {
  video: Video;
}

export function ProcessingStatus({ video }: ProcessingStatusProps) {
  const { data: status, refetch } = useQuery({
    queryKey: ["videoStatus", video._id],
    queryFn: () => videosApi.getStatus(video._id),
    initialData: {
      status: video.status,
      progress: video.processingProgress,
      error: video.processingError,
    },
    refetchInterval:
      video.status === Status.COMPLETED || video.status === Status.FAILED
        ? false
        : 3000,
  });

  useWebSocket("progress", (data) => {
    if (data.videoId === video._id) {
      refetch();
    }
  });

  const getStatusIcon = () => {
    switch (status.status) {
      case Status.COMPLETED:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case Status.FAILED:
        return <XCircle className="h-6 w-6 text-red-500" />;
      case Status.TRANSCRIBING:
      case Status.GENERATING_QUESTIONS:
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case Status.UPLOADED:
        return "Waiting to process";
      case Status.TRANSCRIBING:
        return "Transcribing audio...";
      case Status.GENERATING_QUESTIONS:
        return "Generating questions...";
      case Status.COMPLETED:
        return "Processing complete";
      case Status.FAILED:
        return "Processing failed";
      default:
        return "Processing";
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case Status.COMPLETED:
        return "default";
      case Status.FAILED:
        return "destructive";
      case Status.TRANSCRIBING:
      case Status.GENERATING_QUESTIONS:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-semibold">{getStatusText()}</p>
            <Badge variant={getStatusColor() as any} className="mt-1">
              {status.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>

        {status.progress > 0 && status.progress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{status.progress}%</span>
            </div>
            <Progress value={status.progress} />
          </div>
        )}

        {status.status === Status.FAILED && status.error && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {status.error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span>{Math.floor(video.duration / 60)} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Language:</span>
            <span>{video.language.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">File Size:</span>
            <span>{(video.fileSize / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
