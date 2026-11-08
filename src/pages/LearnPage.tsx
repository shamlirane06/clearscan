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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-5 w-5 text-teal-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Threat Intelligence &amp; Academy
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Advisories on quishing mechanics, reverse-intent payment fraud, and interactive phishing simulations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab("modules")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "modules"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-teal-400" />
            <span>Threat Briefs</span>
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "quiz"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Incident Quiz</span>
          </button>
        </div>
      </div>

      {activeTab === "modules" ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Topics Navigation Sidebar */}
          <div className="space-y-1.5">
            <h3 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Security Briefing Topics
            </h3>
            {SAFETY_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                  selectedTopicId === topic.id
                    ? "border border-slate-700 bg-slate-800 text-white shadow-sm"
                    : "border border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <span className="truncate pr-2">{topic.title}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
              </button>
            ))}
          </div>

          {/* Active Topic Detail Content */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <span className="inline-flex rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-0.5 text-xs font-medium text-teal-300">
                {activeTopic.category}
              </span>
              <h3 className="mt-3 text-xl sm:text-2xl font-bold text-white tracking-tight">{activeTopic.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{activeTopic.summary}</p>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Key Attack Vectors &amp; Threat Mechanics
              </h4>
              <ul className="space-y-2.5">
                {activeTopic.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-teal-500/25 bg-teal-950/20 p-4">
              <h5 className="flex items-center gap-2 text-xs font-semibold text-teal-300">
                <Lightbulb className="h-4 w-4" />
                <span>Zero-Trust Security Principle</span>
              </h5>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                {activeTopic.takeaway}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Phishing Quiz */
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-7 shadow-lg">
            {!quizCompleted ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-xs font-semibold text-teal-400">
                    Scenario {currentQuestionIndex + 1} of {PHISHING_QUIZ_QUESTIONS.length}
                  </span>
                  <span className="rounded-md border border-slate-700 bg-slate-850 px-2.5 py-1 text-xs font-medium text-slate-300">
                    Score: {score}/{PHISHING_QUIZ_QUESTIONS.length}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-medium text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQuestion.correctIndex;

                    let btnClass = "border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-300";
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500/50 bg-emerald-950/30 text-emerald-300 font-medium";
                      } else if (isSelected) {
                        btnClass = "border-rose-500/50 bg-rose-950/30 text-rose-300";
                      }
                    } else if (isSelected) {
                      btnClass = "border-teal-500 bg-teal-500/10 text-teal-300 font-medium";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`flex w-full items-start gap-3.5 rounded-xl border p-3.5 text-left text-xs sm:text-sm transition-colors ${btnClass}`}
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current text-xs font-semibold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{option}</span>
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswerSubmitted && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs sm:text-sm text-slate-300 space-y-1.5">
                    <p className="font-semibold text-slate-400">
                      Technical Explanation:
                    </p>
                    <p className="leading-relaxed text-slate-300">{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-teal-500"
                    >
                      {currentQuestionIndex + 1 < PHISHING_QUIZ_QUESTIONS.length
                        ? "Next Scenario"
                        : "View Results"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Completion Summary */
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-500/30 bg-teal-500/10 text-teal-400">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">Evaluation Completed</h3>
                <p className="text-sm text-slate-300">
                  You correctly identified <strong className="text-teal-400 font-bold">{score}</strong> out of{" "}
                  <strong>{PHISHING_QUIZ_QUESTIONS.length}</strong> threat scenarios.
                </p>

                <p className="max-w-md mx-auto text-xs text-slate-400 leading-relaxed">
                  {score === PHISHING_QUIZ_QUESTIONS.length
                    ? "Maximum Threat Resilience: Excellent proficiency in identifying typosquatting, shortener cloaking, and reverse-intent QR fraud."
                    : score >= 3
                    ? "High Competency: Good instincts on QR vectors. Review typosquatting character substitutions for full coverage."
                    : "Moderate Vulnerability: Review the active security briefs to sharpen your detection of disguised URLs."}
                </p>

                <button
                  onClick={handleResetQuiz}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 shadow-sm hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restart Simulation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
