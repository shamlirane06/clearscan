import type { RiskClassification } from "../types/scan";

interface RiskMeterProps {
  score: number;
  classification: RiskClassification;
  size?: "sm" | "md" | "lg";
}

function riskTheme(score: number, classification: RiskClassification) {
  const unable = score < 0 || classification === "UNABLE_TO_VERIFY";
  if (unable) {
    return {
      stroke: "var(--cs-border-strong)",
      text: "var(--cs-text-muted)",
      label: "Unable to Verify",
      productLabel: "Verification incomplete",
    };
  }
  if (score >= 75 || classification === "CRITICAL_RISK") {
    return {
      stroke: "var(--cs-danger)",
      text: "var(--cs-danger)",
      label: "Critical",
      productLabel: "Dangerous",
    };
  }
  if (score >= 50 || classification === "HIGH_RISK") {
    return {
      stroke: "var(--cs-warning)",
      text: "var(--cs-warning)",
      label: "High",
      productLabel: "Dangerous",
    };
  }
  if (score >= 25 || classification === "MODERATE_RISK") {
    return {
      stroke: "var(--cs-warning)",
      text: "var(--cs-warning)",
      label: "Moderate",
      productLabel: "Suspicious",
    };
  }
  return {
    stroke: "var(--cs-brand)",
    text: "var(--cs-brand)",
    label: "Low",
    productLabel: "Low Risk",
  };
}

export default function RiskMeter({ score, classification, size = "md" }: RiskMeterProps) {
  const isUnableToVerify = score < 0 || classification === "UNABLE_TO_VERIFY";
  const displayScore = isUnableToVerify ? "—" : Math.max(0, Math.min(100, score));
  const theme = riskTheme(score, classification);

  const radius = 70;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const progress = isUnableToVerify ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const dimensions =
    size === "sm"
      ? { width: 148, height: 92, fontSize: "1.5rem" }
      : size === "lg"
        ? { width: 228, height: 138, fontSize: "2.5rem" }
        : { width: 196, height: 118, fontSize: "2.125rem" };

  return (
    <div className="cs-risk-meter">
      <div className="cs-risk-meter__dial">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 172 108"
          className="overflow-visible"
          role="img"
          aria-label={`Risk score ${displayScore} out of 100, ${theme.label}`}
        >
          <path
            d="M 16 96 A 70 70 0 0 1 156 96"
            fill="none"
            stroke="var(--cs-surface-raised)"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
          <path
            d="M 16 96 A 70 70 0 0 1 156 96"
            fill="none"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const angle = Math.PI * (1 - tick);
            const inner = 78;
            const outer = 86;
            const cx = 86;
            const cy = 96;
            return (
              <line
                key={tick}
                x1={cx + inner * Math.cos(angle)}
                y1={cy - inner * Math.sin(angle)}
                x2={cx + outer * Math.cos(angle)}
                y2={cy - outer * Math.sin(angle)}
                stroke="var(--cs-border-strong)"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
        <div className="cs-risk-meter__value">
          <span style={{ fontSize: dimensions.fontSize, color: theme.text }}>{displayScore}</span>
          <span>Risk Score</span>
        </div>
      </div>
      <p className="cs-risk-meter__badge" style={{ color: theme.text, borderColor: "currentColor" }}>
        <span className="cs-risk-meter__dot" style={{ background: theme.stroke }} />
        <span>
          {theme.label}
          {theme.productLabel !== theme.label ? ` · ${theme.productLabel}` : ""}
        </span>
      </p>
    </div>
  );
}
