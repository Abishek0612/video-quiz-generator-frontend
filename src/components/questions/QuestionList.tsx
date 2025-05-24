import { Question } from "@/types";
import { QuestionCard } from "./QuestionCard";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionListProps {
  questions: Question[];
  isLoading: boolean;
}

export function QuestionList({ questions, isLoading }: QuestionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No questions generated yet.</p>
      </div>
    );
  }

  // Group questions by segment
  const questionsBySegment = questions.reduce((acc, question) => {
    if (!acc[question.segmentIndex]) {
      acc[question.segmentIndex] = [];
    }
    acc[question.segmentIndex].push(question);
    return acc;
  }, {} as Record<number, Question[]>);

  return (
    <div className="space-y-8">
      {Object.entries(questionsBySegment).map(
        ([segmentIndex, segmentQuestions]) => (
          <div key={segmentIndex} className="space-y-4">
            <h2 className="text-xl font-semibold">
              Segment {Number(segmentIndex) + 1}
            </h2>
            <div className="grid gap-4">
              {segmentQuestions.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  segmentNumber={Number(segmentIndex) + 1}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
