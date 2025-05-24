import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  FileVideo,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
  Trash2,
  Eye,
} from "lucide-react";
import { Video, ProcessingStatus } from "@/types";
import { formatDuration, formatBytes } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VideoCardProps {
  video: Video;
  onDelete: (id: string) => void;
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusIcon = () => {
    switch (video.status) {
      case ProcessingStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case ProcessingStatus.FAILED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case ProcessingStatus.TRANSCRIBING:
      case ProcessingStatus.GENERATING_QUESTIONS:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (video.status) {
      case ProcessingStatus.COMPLETED:
        return "Ready";
      case ProcessingStatus.FAILED:
        return "Failed";
      case ProcessingStatus.TRANSCRIBING:
        return "Transcribing...";
      case ProcessingStatus.GENERATING_QUESTIONS:
        return "Generating questions...";
      default:
        return "Processing";
    }
  };

  const getStatusColor = () => {
    switch (video.status) {
      case ProcessingStatus.COMPLETED:
        return "default";
      case ProcessingStatus.FAILED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <FileVideo className="h-10 w-10 text-primary" />
              <div className="space-y-1">
                <h3 className="font-semibold line-clamp-1">
                  {video.originalName}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{formatDuration(video.duration)}</span>
                  <span>{formatBytes(video.fileSize)}</span>
                  <span>{video.language.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/video/${video._id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <Badge variant={getStatusColor() as any}>{getStatusText()}</Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(video.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {video.processingProgress > 0 && video.processingProgress < 100 && (
            <Progress value={video.processingProgress} className="h-2" />
          )}

          {video.status === ProcessingStatus.COMPLETED && (
            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/video/${video._id}`}>View Transcript</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={`/video/${video._id}#questions`}>View Questions</Link>
              </Button>
            </div>
          )}

          {video.status === ProcessingStatus.FAILED &&
            video.processingError && (
              <p className="text-sm text-destructive">
                Error: {video.processingError}
              </p>
            )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{video.originalName}"? This will
              also delete all associated transcripts and questions. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(video._id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
