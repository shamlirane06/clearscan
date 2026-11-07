import { useState } from "react";
import {
  GraduationCap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { SAFETY_TOPICS, PHISHING_QUIZ_QUESTIONS } from "../data/educationContent";

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<"modules" | "quiz">("modules");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(SAFETY_TOPICS[0].id);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const activeTopic = SAFETY_TOPICS.find((t) => t.id === selectedTopicId) || SAFETY_TOPICS[0];
  const currentQuestion = PHISHING_QUIZ_QUESTIONS[currentQuestionIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    if (selectedAnswer === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < PHISHING_QUIZ_QUESTIONS.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
              Learn to Stay Safe
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Interactive guide to understanding modern QR phishing and digital payment fraud.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-emerald-900/10 p-1">
          <button
            onClick={() => setActiveTab("modules")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "modules"
                ? "bg-white text-emerald-950 shadow-sm"
                : "text-emerald-900/70 hover:text-emerald-950"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "quiz"
                ? "bg-white text-emerald-950 shadow-sm"
                : "text-emerald-900/70 hover:text-emerald-950"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Phishing Quiz
          </button>
        </div>
      </div>

      {activeTab === "modules" ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Topics Navigation Sidebar */}
          <div className="space-y-1.5">
            <h3 className="px-2 pb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Security Topics
            </h3>
            {SAFETY_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                  selectedTopicId === topic.id
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "text-zinc-700 hover:bg-emerald-50"
                }`}
              >
                <span>{topic.title}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Active Topic Detail Content */}
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm space-y-6">
            <div>
              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                {activeTopic.category}
              </span>
              <h3 className="mt-2 text-xl font-bold text-emerald-950">{activeTopic.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{activeTopic.summary}</p>
            </div>

            <div className="border-t border-zinc-100 pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                Key Attack Patterns &amp; Risks
              </h4>
              <ul className="space-y-2.5">
                {activeTopic.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-950">
                <Lightbulb className="h-4 w-4 text-emerald-700" />
                Golden Takeaway
              </h5>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900 font-medium">
                {activeTopic.takeaway}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Phishing Quiz */
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            {!quizCompleted ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Question {currentQuestionIndex + 1} of {PHISHING_QUIZ_QUESTIONS.length}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    Score: {score}/{PHISHING_QUIZ_QUESTIONS.length}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 sm:text-lg">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQuestion.correctIndex;

                    let btnClass = "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 text-zinc-800";
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnClass = "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold";
                      } else if (isSelected) {
                        btnClass = "border-rose-300 bg-rose-50 text-rose-900";
                      }
                    } else if (isSelected) {
                      btnClass = "border-emerald-700 bg-emerald-50/60 text-emerald-950 font-semibold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-xs transition-all ${btnClass}`}
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{option}</span>
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswerSubmitted && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">
                    <p className="font-bold text-zinc-900">Explanation:</p>
                    <p className="mt-1 leading-relaxed">{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900"
                    >
                      {currentQuestionIndex + 1 < PHISHING_QUIZ_QUESTIONS.length
                        ? "Next Question"
                        : "Finish Quiz"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Completion Summary */
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-950">Quiz Completed!</h3>
                <p className="text-sm text-zinc-600">
                  You scored <strong className="text-emerald-900 font-bold">{score}</strong> out of{" "}
                  <strong>{PHISHING_QUIZ_QUESTIONS.length}</strong>!
                </p>

                <p className="max-w-md mx-auto text-xs text-zinc-500 leading-relaxed">
                  {score === PHISHING_QUIZ_QUESTIONS.length
                    ? "Exceptional! You have strong vigilance against QR quishing and fraudulent links."
                    : score >= 3
                    ? "Great job! A bit more practice on lookalike domains and you will be fully secure."
                    : "Good effort! Review the knowledge base modules above to strengthen your anti-phishing reflexes."}
                </p>

                <button
                  onClick={handleResetQuiz}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
