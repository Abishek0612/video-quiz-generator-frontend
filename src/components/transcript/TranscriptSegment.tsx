import { TranscriptSegment as SegmentType } from "@/types";
import { formatTimeRange } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TranscriptSegmentProps {
  segment: SegmentType;
  isSelected: boolean;
  onClick: () => void;
  searchQuery?: string;
}

export function TranscriptSegment({
  segment,
  isSelected,
  onClick,
  searchQuery,
}: TranscriptSegmentProps) {
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-300 text-black">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      id={`segment-${segment.segmentIndex}`}
      className={cn(
        "p-4 rounded-lg border cursor-pointer transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Segment {segment.segmentIndex + 1}</h3>
        <span className="text-sm text-muted-foreground">
          {formatTimeRange(segment.startTime, segment.endTime)}
        </span>
      </div>
      <p className="text-sm leading-relaxed">
        {searchQuery ? highlightText(segment.text, searchQuery) : segment.text}
      </p>
    </div>
  );
}
