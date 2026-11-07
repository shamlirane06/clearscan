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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              Threat Intelligence &amp; Academy
            </h2>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            Advisories on quishing mechanics, fake UPI mandates, and interactive phishing simulation
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          <button
            onClick={() => setActiveTab("modules")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              activeTab === "modules"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
            <span>THREAT BRIEFS</span>
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
              activeTab === "quiz"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
            <span>INCIDENT QUIZ</span>
          </button>
        </div>
      </div>

      {activeTab === "modules" ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Topics Navigation Sidebar */}
          <div className="space-y-1.5">
            <h3 className="px-2 pb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Active Security Advisories
            </h3>
            {SAFETY_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left font-mono text-xs font-medium transition-all ${
                  selectedTopicId === topic.id
                    ? "border border-zinc-700 bg-zinc-800 text-white shadow-sm"
                    : "border border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <span className="truncate pr-2">{topic.title}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
              </button>
            ))}
          </div>

          {/* Active Topic Detail Content */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl space-y-6">
            <div>
              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                CATEGORY: {activeTopic.category}
              </span>
              <h3 className="mt-2.5 text-xl font-bold text-white font-mono">{activeTopic.title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400">{activeTopic.summary}</p>
            </div>

            <div className="border-t border-zinc-800 pt-5 space-y-3">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
                Key Attack Vectors &amp; Threat Mechanics
              </h4>
              <ul className="space-y-2.5">
                {activeTopic.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
              <h5 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Lightbulb className="h-3.5 w-3.5" />
                Zero-Trust Playbook Rule
              </h5>
              <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                {activeTopic.takeaway}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Phishing Quiz */
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-xl">
            {!quizCompleted ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    SCENARIO #{currentQuestionIndex + 1} OF {PHISHING_QUIZ_QUESTIONS.length}
                  </span>
                  <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-300">
                    SCORE: {score}/{PHISHING_QUIZ_QUESTIONS.length}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white font-mono leading-relaxed">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQuestion.correctIndex;

                    let btnClass = "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300";
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500/50 bg-emerald-950/30 text-emerald-300 font-semibold";
                      } else if (isSelected) {
                        btnClass = "border-rose-500/50 bg-rose-950/30 text-rose-300";
                      }
                    } else if (isSelected) {
                      btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-xs transition-all ${btnClass}`}
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border border-current font-mono text-[10px]">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{option}</span>
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswerSubmitted && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300 space-y-1">
                    <p className="font-mono font-bold uppercase tracking-wider text-zinc-400">
                      Technical Telemetry Explanation:
                    </p>
                    <p className="leading-relaxed text-zinc-300">{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="rounded-xl bg-emerald-500 px-5 py-2 font-mono text-xs font-bold text-zinc-950 shadow-sm transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      COMMIT DECISION
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="rounded-xl bg-emerald-500 px-5 py-2 font-mono text-xs font-bold text-zinc-950 shadow-sm transition-colors hover:bg-emerald-400"
                    >
                      {currentQuestionIndex + 1 < PHISHING_QUIZ_QUESTIONS.length
                        ? "NEXT SCENARIO"
                        : "VIEW EVALUATION"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Completion Summary */
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-white font-mono">Evaluation Completed</h3>
                <p className="font-mono text-sm text-zinc-400">
                  You verified <strong className="text-emerald-400 font-bold">{score}</strong> out of{" "}
                  <strong>{PHISHING_QUIZ_QUESTIONS.length}</strong> threat scenarios accurately.
                </p>

                <p className="max-w-md mx-auto text-xs text-zinc-500 leading-relaxed">
                  {score === PHISHING_QUIZ_QUESTIONS.length
                    ? "Maximum Threat Resilience: Excellent proficiency in detecting typosquatting, shortener cloaking, and reverse-intent QR fraud."
                    : score >= 3
                    ? "High Competency: Good instincts on QR vectors. Review typosquatting character substitutions for full coverage."
                    : "Moderate Vulnerability: Review the active security briefs to sharpen your detection of disguised URLs."}
                </p>

                <button
                  onClick={handleResetQuiz}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 font-mono text-xs font-semibold text-zinc-200 shadow-sm hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  RESTART SIMULATION
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
