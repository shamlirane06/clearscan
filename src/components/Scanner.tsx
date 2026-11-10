import type { BackendScanResponse } from "../types/scan";
import ScannerPage from "../pages/ScannerPage";

interface ScannerProps {
  onScanComplete?: (response: BackendScanResponse) => void;
}

export default function Scanner({ onScanComplete }: ScannerProps) {
  return <ScannerPage onScanComplete={onScanComplete} />;
}
