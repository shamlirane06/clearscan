import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ShieldLogo(props: IconProps) {
  return <IconBase {...props}><path d="M12 2.8 19.2 5.7v5.4c0 4.8-2.9 8.2-7.2 10.1-4.3-1.9-7.2-5.3-7.2-10.1V5.7L12 2.8Z" /><path d="m8.6 11.9 2.2 2.2 4.8-4.9" /></IconBase>;
}

export function DashboardGrid(props: IconProps) {
  return <IconBase {...props}><rect x="3.5" y="3.5" width="6.8" height="6.8" rx="1" /><rect x="13.7" y="3.5" width="6.8" height="6.8" rx="1" /><rect x="3.5" y="13.7" width="6.8" height="6.8" rx="1" /><rect x="13.7" y="13.7" width="6.8" height="6.8" rx="1" /></IconBase>;
}

export function ScanHistory(props: IconProps) {
  return <IconBase {...props}><path d="M3.8 8.2V4.5m0 0h3.7M3.8 4.5 6.6 7" /><path d="M4.5 11.2a7.6 7.6 0 1 0 2.2-5.4" /><path d="M12 7.7v4.7l3 1.8" /></IconBase>;
}

export function ReportDocument(props: IconProps) {
  return <IconBase {...props}><path d="M6.5 3.5h7l4 4v12.9H6.5c-.8 0-1.5-.7-1.5-1.5V5c0-.8.7-1.5 1.5-1.5Z" /><path d="M13.5 3.8v4h4M8.5 12h6.8M8.5 15.3h6.8M8.5 8.9h1.6" /></IconBase>;
}

export function HelpCircle(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="8.7" /><path d="M9.7 9.2a2.4 2.4 0 1 1 4.2 1.6c-.9 1-1.9 1.2-1.9 2.8M12 17.1h.01" /></IconBase>;
}

export function InfoCircle(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="8.7" /><path d="M12 10.8v5M12 7.9h.01" /></IconBase>;
}

export function Gear(props: IconProps) {
  return <IconBase {...props}><path d="m9.8 3.7.5-1h3.4l.5 1a2 2 0 0 0 2.8.8l1-.5 2.4 2.4-.5 1a2 2 0 0 0 .8 2.8l1 .5v3.4l-1 .5a2 2 0 0 0-.8 2.8l.5 1-2.4 2.4-1-.5a2 2 0 0 0-2.8.8l-.5 1h-3.4l-.5-1a2 2 0 0 0-2.8-.8l-1 .5-2.4-2.4.5-1a2 2 0 0 0-.8-2.8l-1-.5v-3.4l1-.5a2 2 0 0 0 .8-2.8l-.5-1L6 4l1 .5a2 2 0 0 0 2.8-.8Z" transform="translate(-1.2 -1.2) scale(1.1)" /><circle cx="12" cy="12" r="3" /></IconBase>;
}

export function LinkChain(props: IconProps) {
  return <IconBase {...props}><path d="m9.7 14.3 4.6-4.6" /><path d="M8.2 16.5H6.8a4.3 4.3 0 0 1 0-8.6h3.1M15.8 7.5h1.4a4.3 4.3 0 1 1 0 8.6h-3.1" /></IconBase>;
}

export function QrCodeMark(props: IconProps) {
  return <IconBase {...props}>
    <path d="M3.5 9V5.2c0-.9.8-1.7 1.7-1.7H9M15 3.5h3.8c.9 0 1.7.8 1.7 1.7V9M20.5 15v3.8c0 .9-.8 1.7-1.7 1.7H15M9 20.5H5.2c-.9 0-1.7-.8-1.7-1.7V15" />
    <rect x="6.5" y="6.5" width="3" height="3" rx=".35" /><rect x="14.5" y="6.5" width="3" height="3" rx=".35" /><rect x="6.5" y="14.5" width="3" height="3" rx=".35" />
    <path d="M14.5 14.5h1.7v1.7h1.7M14.5 18v2.5M20.5 14.5v2.2M18 20.5h2.5" />
  </IconBase>;
}

export function Camera(props: IconProps) {
  return <IconBase {...props}><path d="M4 7.5h3l1.4-2h7.2l1.4 2h3a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z" /><circle cx="12" cy="13.4" r="3.3" /></IconBase>;
}

export function BarChart(props: IconProps) {
  return <IconBase {...props}><path d="M4 20V12M9.3 20V5M14.7 20v-9M20 20V8M3 20.5h18" /></IconBase>;
}

export function WarningShield(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 19 5.8v5.1c0 4.7-2.8 8-7 10.1-4.2-2.1-7-5.4-7-10.1V5.8L12 3Z" /><path d="M12 8v5M12 16.4h.01" /></IconBase>;
}

export function ShieldCheck(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 19 5.8v5.1c0 4.7-2.8 8-7 10.1-4.2-2.1-7-5.4-7-10.1V5.8L12 3Z" /><path d="m8.7 12 2.1 2.1 4.5-4.6" /></IconBase>;
}

export function CheckCircle(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="m7.8 12.2 2.7 2.7 5.8-6" /></IconBase>;
}

export function WarningTriangle(props: IconProps) {
  return <IconBase {...props}><path d="M10.3 4.5a2 2 0 0 1 3.4 0l7 12.1a2 2 0 0 1-1.7 3H5a2 2 0 0 1-1.7-3l7-12.1Z" /><path d="M12 9v4.2M12 16.4h.01" /></IconBase>;
}

export function ArrowRight(props: IconProps) {
  return <IconBase {...props}><path d="M4 12h15M13 6l6 6-6 6" /></IconBase>;
}

export function ChevronDown(props: IconProps) {
  return <IconBase {...props}><path d="m6.5 9 5.5 5.5L17.5 9" /></IconBase>;
}

export function Close(props: IconProps) {
  return <IconBase {...props}><path d="m6 6 12 12M18 6 6 18" /></IconBase>;
}

export function MenuBars(props: IconProps) {
  return <IconBase {...props}><path d="M4 6.5h16M4 12h16M4 17.5h16" /></IconBase>;
}

export function LoadingCircle(props: IconProps) {
  return <IconBase {...props}><path d="M20 12a8 8 0 1 1-2.3-5.6" /></IconBase>;
}

export function ChevronUp(props: IconProps) {
  return <IconBase {...props}><path d="m6.5 15 5.5-5.5 5.5 5.5" /></IconBase>;
}

export function CheckMark(props: IconProps) {
  return <IconBase {...props}><path d="m5 12.5 4.2 4.2L19 7" /></IconBase>;
}

export function AlertOctagon(props: IconProps) {
  return <IconBase {...props}><path d="m8 3.5 8 0 4.5 4.5v8L16 20.5H8L3.5 16V8L8 3.5Z" /><path d="M12 7.5v5.3M12 16.2h.01" /></IconBase>;
}

export function GlobeMark(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></IconBase>;
}

export function CopyMark(props: IconProps) {
  return <IconBase {...props}><rect x="8" y="8" width="11" height="12" rx="1.5" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v10A1.5 1.5 0 0 0 5.5 17H8" /></IconBase>;
}

export function RotateBack(props: IconProps) {
  return <IconBase {...props}><path d="M4 8V4m0 0h4M4 4l3.1 3.1A8 8 0 1 1 4 12" /><path d="M12 8v4l2.8 1.8" /></IconBase>;
}

export function Processor(props: IconProps) {
  return <IconBase {...props}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx=".5" /><path d="M9 2.5v3.2m6-3.2v3.2M9 18.3v3.2m6-3.2v3.2M2.5 9h3.2m-3.2 6h3.2m12.3-6h3.2m-3.2 6h3.2" /></IconBase>;
}

export function LockMark(props: IconProps) {
  return <IconBase {...props}><rect x="5" y="10" width="14" height="10.5" rx="1.7" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v2.5" /></IconBase>;
}

export function ExternalLink(props: IconProps) {
  return <IconBase {...props}><path d="M13 5h6v6M19 5l-9 9" /><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></IconBase>;
}
