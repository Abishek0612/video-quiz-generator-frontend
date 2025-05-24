import { useState } from "react";
import { Search } from "lucide-react";
import { Video } from "@/types";
import { TranscriptSegment } from "./TranscriptSegment";
import { SegmentTimeline } from "./SegmentTimeline";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptViewerProps {
  video: Video;
}

export function TranscriptViewer({ video }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState(0);

  const filteredSegments =
    video.transcriptionSegments?.filter((segment) =>
      segment.text.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleSegmentClick = (index: number) => {
    setSelectedSegment(index);
    const element = document.getElementById(`segment-${index}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Full Transcript</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search in transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {searchQuery && filteredSegments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No results found for "{searchQuery}"
                  </p>
                ) : (
                  (searchQuery
                    ? filteredSegments
                    : video.transcriptionSegments
                  )?.map((segment, index) => (
                    <TranscriptSegment
                      key={index}
                      segment={segment}
                      isSelected={selectedSegment === segment.segmentIndex}
                      onClick={() => handleSegmentClick(segment.segmentIndex)}
                      searchQuery={searchQuery}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div>
        <SegmentTimeline
          segments={video.transcriptionSegments || []}
          selectedSegment={selectedSegment}
          onSegmentClick={handleSegmentClick}
          videoDuration={video.duration}
        />
      </div>
    </div>
  );
}
