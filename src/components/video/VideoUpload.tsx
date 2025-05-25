import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileVideo,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { videosApi } from "@/lib/api/videos";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SUPPORTED_FORMATS = {
  "video/mp4": [".mp4"],
  "video/avi": [".avi"],
  "video/quicktime": [".mov"],
  "video/x-ms-wmv": [".wmv"],
  "video/x-matroska": [".mkv"],
  "video/webm": [".webm"],
  "video/x-msvideo": [".avi"],
};

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

interface UploadError {
  message: string;
  details?: string;
  type?: "validation" | "server" | "network" | "ffmpeg" | "format" | "size";
}

export function VideoUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      language,
    }: {
      file: File;
      language: string;
    }) => {
      // Reset error state
      setUploadError(null);

      // Log file details for debugging
      console.log("Uploading file:", {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeFormatted: formatBytes(file.size),
        language: language,
      });

      // Create FormData and log its contents
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("language", language);

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1]);
      }

      try {
        const response = await videosApi.upload(file, language);
        console.log("Upload successful:", response);
        return response;
      } catch (error: any) {
        console.error("Upload failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Upload completed successfully:", data);
      toast.success(
        "Video uploaded successfully! Processing will begin shortly.",
        {
          description: "You can track the progress in the video details page.",
          duration: 5000,
        }
      );
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      setSelectedFile(null);
      setUploadProgress(0);
      setUploadError(null);

      // Navigate to video detail page after a short delay
      setTimeout(() => {
        navigate(`/video/${data._id}`);
      }, 1000);
    },
    onError: (error: any) => {
      console.error("Upload error:", error);

      // Extract error details from different possible error structures
      const response = error.response?.data;
      const errorMessage =
        response?.message || error.message || "Failed to upload video";
      const errorDetails = response?.error || error.name || "";
      const statusCode = error.response?.status;

      // Determine error type and provide specific feedback
      let errorType: UploadError["type"] = "server";
      let userFriendlyMessage = errorMessage;
      let userFriendlyDetails = errorDetails;
      let toastMessage = errorMessage;

      // Network errors
      if (
        error.code === "NETWORK_ERROR" ||
        error.message?.includes("Network Error")
      ) {
        errorType = "network";
        userFriendlyMessage = "Network connection failed";
        userFriendlyDetails =
          "Please check your internet connection and try again.";
        toastMessage =
          "Network error. Please check your connection and try again.";
      }
      // File size errors
      else if (
        errorMessage.includes("file size") ||
        errorMessage.includes("too large") ||
        statusCode === 413
      ) {
        errorType = "size";
        userFriendlyMessage = "File is too large";
        userFriendlyDetails = `Maximum file size is 1GB. Your file is ${formatBytes(
          selectedFile?.size || 0
        )}.`;
        toastMessage = "File is too large. Maximum size is 1GB.";
      }
      // FFmpeg/video processing errors
      else if (
        errorMessage.includes("duration") ||
        errorMessage.includes("FFmpeg") ||
        errorMessage.includes("ffmpeg") ||
        errorMessage.includes("ffprobe")
      ) {
        errorType = "ffmpeg";
        userFriendlyMessage = "Video processing failed";
        userFriendlyDetails =
          "The video file may be corrupted or in an unsupported format. Please try uploading a different video file.";
        toastMessage =
          "Failed to process video. Please ensure the file is a valid video format.";
      }
      // Format/validation errors
      else if (
        errorMessage.includes("Invalid video format") ||
        errorMessage.includes("format") ||
        errorMessage.includes("codec")
      ) {
        errorType = "format";
        userFriendlyMessage = "Invalid video format";
        userFriendlyDetails =
          "Please upload a video file in one of these formats: MP4, AVI, MOV, WMV, MKV, or WebM.";
        toastMessage =
          "Invalid video format. Please upload MP4, AVI, MOV, WMV, or MKV files.";
      }
      // File not found or path errors
      else if (
        errorMessage.includes("ENOENT") ||
        errorMessage.includes("file not found")
      ) {
        errorType = "server";
        userFriendlyMessage = "File upload failed";
        userFriendlyDetails =
          "The file could not be saved on the server. Please try again.";
        toastMessage = "File upload failed. Please try again.";
      }
      // Validation errors
      else if (errorMessage.includes("validation") || statusCode === 400) {
        errorType = "validation";
        userFriendlyMessage = "Upload validation failed";
        userFriendlyDetails = errorMessage;
        toastMessage =
          "Invalid upload data. Please check your file and try again.";
      }
      // Authentication errors
      else if (statusCode === 401 || statusCode === 403) {
        errorType = "server";
        userFriendlyMessage = "Authentication failed";
        userFriendlyDetails = "Please log in again and try uploading.";
        toastMessage = "Authentication failed. Please log in again.";
      }
      // Server errors
      else if (statusCode >= 500) {
        errorType = "server";
        userFriendlyMessage = "Server error";
        userFriendlyDetails =
          "The server encountered an error while processing your upload. Please try again later.";
        toastMessage = "Server error. Please try again later.";
      }

      setUploadError({
        message: userFriendlyMessage,
        details: userFriendlyDetails,
        type: errorType,
      });

      // Show appropriate toast message
      toast.error(toastMessage, {
        description:
          errorType === "ffmpeg"
            ? "Try converting your video to MP4 format or use a different file."
            : undefined,
        duration: 8000,
      });

      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Reset error state
    setUploadError(null);

    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      const rejectedFile = rejectedFiles[0].file;
      console.log("File rejected:", rejectedFiles[0]);

      let errorType: UploadError["type"] = "validation";
      let errorMessage = "File rejected";
      let errorDetails = "";

      if (error.code === "file-too-large") {
        errorType = "size";
        errorMessage = "File is too large";
        errorDetails = `Maximum file size is 1GB. Your file is ${formatBytes(
          rejectedFile.size
        )}.`;
        toast.error("File is too large. Maximum size is 1GB.");
      } else if (error.code === "file-invalid-type") {
        errorType = "format";
        errorMessage = "Invalid file type";
        errorDetails =
          "Please upload a valid video file (MP4, AVI, MOV, WMV, MKV, WebM).";
        toast.error("Invalid file type. Please upload a video file.");
      } else {
        errorDetails = error.message || "Unknown validation error.";
        toast.error("File validation failed");
      }

      setUploadError({
        message: errorMessage,
        details: errorDetails,
        type: errorType,
      });
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      console.log("File accepted:", {
        name: file.name,
        type: file.type,
        size: formatBytes(file.size),
      });

      // Additional client-side validation
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const validExtensions = ["mp4", "avi", "mov", "wmv", "mkv", "webm"];

      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        setUploadError({
          message: "Invalid file format",
          details: `File extension ".${fileExtension}" is not supported. Supported formats: ${validExtensions
            .join(", ")
            .toUpperCase()}`,
          type: "format",
        });
        toast.error("Invalid file format", {
          description: `Supported formats: ${validExtensions
            .join(", ")
            .toUpperCase()}`,
        });
        return;
      }

      // Additional MIME type validation
      const validMimeTypes = Object.keys(SUPPORTED_FORMATS);
      if (!validMimeTypes.includes(file.type) && file.type !== "") {
        console.warn(
          `Warning: Unexpected MIME type ${file.type} for file ${file.name}`
        );
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: SUPPORTED_FORMATS,
      maxFiles: 1,
      maxSize: MAX_FILE_SIZE,
    });

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadError({
        message: "File is too large",
        details: `Maximum file size is 1GB. Your file is ${formatBytes(
          selectedFile.size
        )}.`,
        type: "size",
      });
      toast.error("File is too large. Maximum size is 1GB.");
      return;
    }

    console.log("Starting upload for:", selectedFile.name);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    uploadMutation.mutate(
      { file: selectedFile, language },
      {
        onSettled: () => {
          clearInterval(progressInterval);
          setUploadProgress(100);
        },
      }
    );
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
  };

  const getErrorIcon = (errorType?: UploadError["type"]) => {
    switch (errorType) {
      case "network":
        return <AlertCircle className="h-4 w-4" />;
      case "size":
        return <AlertCircle className="h-4 w-4" />;
      case "format":
        return <AlertCircle className="h-4 w-4" />;
      case "ffmpeg":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>
          Upload your lecture video to automatically generate quiz questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Alert */}
        {uploadError && (
          <Alert variant="destructive">
            {getErrorIcon(uploadError.type)}
            <AlertTitle>{uploadError.message}</AlertTitle>
            {uploadError.details && (
              <AlertDescription className="mt-2">
                {uploadError.details}
              </AlertDescription>
            )}
          </Alert>
        )}

        {/* Success State */}
        {uploadMutation.isSuccess && !selectedFile && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">
              Upload Successful!
            </AlertTitle>
            <AlertDescription className="text-green-800">
              Your video has been uploaded and is being processed. You will be
              redirected to the video details page.
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload Area */}
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all duration-200 ease-in-out
              ${
                isDragActive && !isDragReject
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : isDragReject
                  ? "border-destructive bg-destructive/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }
              ${uploadError ? "border-destructive" : ""}
            `}
          >
            <input {...getInputProps()} />

            <Upload
              className={`
              mx-auto h-12 w-12 mb-4 transition-colors
              ${
                isDragActive && !isDragReject
                  ? "text-primary"
                  : isDragReject
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            `}
            />

            <p className="text-lg font-medium mb-2">
              {isDragActive && !isDragReject
                ? "Drop your video here"
                : isDragReject
                ? "File not supported"
                : "Drag & drop your video here"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>

            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-secondary rounded">MP4</span>
              <span className="px-2 py-1 bg-secondary rounded">AVI</span>
              <span className="px-2 py-1 bg-secondary rounded">MOV</span>
              <span className="px-2 py-1 bg-secondary rounded">WMV</span>
              <span className="px-2 py-1 bg-secondary rounded">MKV</span>
              <span className="px-2 py-1 bg-secondary rounded">WebM</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Maximum file size: 1GB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected File Display */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/50">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileVideo className="h-10 w-10 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{formatBytes(selectedFile.size)}</span>
                    <span>•</span>
                    <span>{selectedFile.type || "Unknown type"}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={uploadMutation.isPending}
                className="flex-shrink-0 ml-2"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="language">Video Language</Label>
              <Select
                value={language}
                onValueChange={setLanguage}
                disabled={uploadMutation.isPending}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Upload Progress */}
            {(uploadMutation.isPending || uploadProgress > 0) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {uploadProgress < 100 ? "Uploading..." : "Processing..."}
                  </span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {uploadProgress < 100
                    ? "Uploading your video file to the server..."
                    : "Upload complete! Processing will continue in the background."}
                </p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending || !selectedFile}
              className="w-full"
              size="lg"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        )}

        {/* Help Text */}
        <div className="rounded-lg bg-muted p-4">
          <h4 className="text-sm font-medium mb-2">Tips for best results:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • Ensure your video has clear audio for accurate transcription
            </li>
            <li>
              • Videos in English work best, but other languages are supported
            </li>
            <li>• Shorter videos (under 30 minutes) process faster</li>
            <li>• MP4 format is recommended for best compatibility</li>
            <li>• Make sure your video file is not corrupted</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
