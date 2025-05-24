import { TranscriptSegment } from "@/types";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SegmentTimelineProps {
  segments: TranscriptSegment[];
  selectedSegment: number;
  onSegmentClick: (index: number) => void;
  videoDuration: number;
}

export function SegmentTimeline({
  segments,
  selectedSegment,
  onSegmentClick,
  videoDuration,
}: SegmentTimelineProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {segments.map((segment) => {
            const widthPercentage =
              ((segment.endTime - segment.startTime) / videoDuration) * 100;
            const isSelected = selectedSegment === segment.segmentIndex;

            return (
              <button
                key={segment.segmentIndex}
                onClick={() => onSegmentClick(segment.segmentIndex)}
                className={cn(
                  "w-full text-left p-3 rounded-md transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Segment {segment.segmentIndex + 1}
                  </span>
                  <span className="text-xs">
                    {formatDuration(segment.startTime)}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={cn(
                      "h-full rounded-full transition-colors",
                      isSelected ? "bg-primary-foreground/30" : "bg-primary"
                    )}
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
