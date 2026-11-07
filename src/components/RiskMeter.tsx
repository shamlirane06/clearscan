import type { RiskClassification } from "../types/scan";

interface RiskMeterProps {
  score: number; // 0-100 or -1
  classification: RiskClassification;
  size?: "sm" | "md" | "lg";
}

export default function RiskMeter({ score, classification, size = "md" }: RiskMeterProps) {
  const isUnableToVerify = score < 0 || classification === "UNABLE_TO_VERIFY";
  const displayScore = isUnableToVerify ? "—" : Math.max(0, Math.min(100, score));

  // Determine color theme based on score / classification
  let label = "Low Risk";
  let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";

  if (isUnableToVerify) {
    label = "Unable to Verify";
    badgeColor = "bg-zinc-100 text-zinc-700 border-zinc-300";
  } else if (score >= 75) {
    label = "Critical Risk";
    badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
  } else if (score >= 50) {
    label = "High Risk";
    badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
  } else if (score >= 25) {
    label = "Moderate Risk";
    badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
  }

  // Semi-circle gauge calculation
  const radius = 70;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half-circle arc
  const progressPercent = isUnableToVerify ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference * (1 - progressPercent);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={size === "sm" ? 140 : size === "lg" ? 220 : 180}
          height={size === "sm" ? 85 : size === "lg" ? 130 : 110}
          viewBox="0 0 180 105"
          className="overflow-visible"
        >
          {/* Background Arc */}
          <path
            d="M 20 95 A 70 70 0 0 1 160 95"
            fill="none"
            stroke="currentColor"
            className="text-zinc-200"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value Arc */}
          <path
            d="M 20 95 A 70 70 0 0 1 160 95"
            fill="none"
            stroke="currentColor"
            className={`transition-all duration-1000 ease-out ${
              score >= 75
                ? "text-rose-600"
                : score >= 50
                ? "text-amber-500"
                : score >= 25
                ? "text-amber-400"
                : "text-emerald-500"
            }`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute bottom-1 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-zinc-900">
            {displayScore}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Risk Score / 100
          </span>
        </div>
      </div>

      {/* Classification Badge */}
      <div className="mt-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeColor}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isUnableToVerify
                ? "bg-zinc-400"
                : score >= 75
                ? "bg-rose-500"
                : score >= 50
                ? "bg-amber-500"
                : score >= 25
                ? "bg-amber-400"
                : "bg-emerald-500"
            }`}
          />
          {label}
        </span>
      </div>
    </div>
  );
}
