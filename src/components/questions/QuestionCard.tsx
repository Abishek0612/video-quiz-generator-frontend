import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Save, X, CheckCircle, AlertCircle } from "lucide-react";
import { Question } from "@/types";
import { questionsApi } from "@/lib/api/questions";
import { formatTimeRange } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface QuestionCardProps {
  question: Question;
  segmentNumber: number;
}

export function QuestionCard({ question, segmentNumber }: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Question>) =>
      questionsApi.update(question._id, data),
    onSuccess: () => {
      toast.success("Question updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["questions", question.videoId],
      });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      question: editedQuestion.question,
      options: editedQuestion.options,
      correctAnswer: editedQuestion.correctAnswer,
      explanation: editedQuestion.explanation,
      difficulty: editedQuestion.difficulty,
      isReviewed: true,
    });
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">Segment {segmentNumber}</h3>
              <Badge className={getDifficultyColor()}>
                {question.difficulty}
              </Badge>
              {question.isReviewed && (
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Reviewed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatTimeRange(question.startTime, question.endTime)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              isEditing ? handleSave() : setIsEditing(!isEditing)
            }
            disabled={updateMutation.isPending}
          >
            {isEditing ? (
              <Save className="h-4 w-4" />
            ) : (
              <Edit2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <Label>Question</Label>
              <Textarea
                value={editedQuestion.question}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    question: e.target.value,
                  })
                }
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              {editedQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm font-medium w-8">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editedQuestion.options];
                      newOptions[index] = e.target.value;
                      setEditedQuestion({
                        ...editedQuestion,
                        options: newOptions,
                      });
                    }}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>

            <div>
              <Label>Correct Answer</Label>
              <RadioGroup
                value={editedQuestion.correctAnswer}
                onValueChange={(value) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    correctAnswer: value,
                  })
                }
                className="mt-2"
              >
                {editedQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={`${question._id}-${index}`}
                    />
                    <Label
                      htmlFor={`${question._id}-${index}`}
                      className="font-normal"
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label>Explanation</Label>
              <Textarea
                value={editedQuestion.explanation}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    explanation: e.target.value,
                  })
                }
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedQuestion(question);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="font-medium mb-3">{question.question}</p>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center space-x-2 p-2 rounded-md
                      ${
                        option === question.correctAnswer
                          ? "bg-green-50 text-green-900"
                          : "bg-gray-50"
                      }
                    `}
                  >
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                    {option === question.correctAnswer && (
                      <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {question.explanation && (
              <div className="border-t pt-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Explanation
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
