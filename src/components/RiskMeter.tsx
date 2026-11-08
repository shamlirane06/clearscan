import type { RiskClassification } from "../types/scan";

interface RiskMeterProps {
  score: number;
  classification: RiskClassification;
  size?: "sm" | "md" | "lg";
}

export default function RiskMeter({ score, classification, size = "md" }: RiskMeterProps) {
  const isUnableToVerify = score < 0 || classification === "UNABLE_TO_VERIFY";
  const displayScore = isUnableToVerify ? "—" : Math.max(0, Math.min(100, score));

  // Determine threat severity theme
  let strokeColor = "#10b981"; // emerald-500
  let textColor = "text-emerald-400";
  let label = "Low Risk · Clean";
  let badgeClasses = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  let dotColor = "bg-emerald-400";

  if (isUnableToVerify) {
    strokeColor = "#64748b"; // slate-500
    textColor = "text-slate-400";
    label = "Unable to Verify";
    badgeClasses = "bg-slate-800 text-slate-300 border-slate-700";
    dotColor = "bg-slate-400";
  } else if (score >= 75) {
    strokeColor = "#f43f5e"; // rose-500
    textColor = "text-rose-400";
    label = "Critical Risk · Blocked";
    badgeClasses = "bg-rose-500/10 text-rose-300 border-rose-500/30";
    dotColor = "bg-rose-500";
  } else if (score >= 50) {
    strokeColor = "#f59e0b"; // amber-500
    textColor = "text-amber-400";
    label = "High Risk · Caution";
    badgeClasses = "bg-amber-500/10 text-amber-300 border-amber-500/30";
    dotColor = "bg-amber-500";
  } else if (score >= 25) {
    strokeColor = "#eab308"; // yellow-500
    textColor = "text-yellow-400";
    label = "Moderate Risk · Suspect";
    badgeClasses = "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
    dotColor = "bg-yellow-400";
  }

  // Semi-circle gauge calculation
  const radius = 64;
  const strokeWidth = 9;
  const circumference = Math.PI * radius; // 180 deg half-circle
  const progress = isUnableToVerify ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const dimensions =
    size === "sm"
      ? { width: 140, height: 80, fontSize: "text-2xl", labelSize: "text-[10px]" }
      : size === "lg"
      ? { width: 220, height: 125, fontSize: "text-4xl", labelSize: "text-xs" }
      : { width: 180, height: 105, fontSize: "text-3xl", labelSize: "text-xs" };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 160 95"
          className="overflow-visible"
          role="img"
          aria-label={`Risk score: ${displayScore} out of 100 (${label})`}
        >
          {/* Calibrated Tick Marks in background */}
          <path
            d="M 16 85 A 64 64 0 0 1 144 85"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          <path
            d="M 16 85 A 64 64 0 0 1 144 85"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Counter */}
        <div className="absolute bottom-1 flex flex-col items-center justify-center">
          <span className={`font-mono font-bold tracking-tight ${dimensions.fontSize} ${textColor}`}>
            {displayScore}
          </span>
          <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
            Threat Index
          </span>
        </div>
      </div>

      {/* Severity Status Badge */}
      <div className="mt-2.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium tracking-normal ${badgeClasses}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          {label}
        </span>
      </div>
    </div>
  );
}
