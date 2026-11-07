import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import ScannerPage from "./pages/ScannerPage";
import HistoryPage from "./pages/HistoryPage";
import LearnPage from "./pages/LearnPage";
import AboutPage from "./pages/AboutPage";
import { useScanHistory } from "./hooks/useScanHistory";
import type { BackendScanResponse } from "./types/scan";

export default function App() {
  const [activePage, setActivePage] = useState<string>("dashboard");
  const { history, addScan, removeScan, clearHistory, stats } = useScanHistory();

  const handleScanComplete = (result: BackendScanResponse) => {
    addScan(result, activePage === "scanner" ? "qr" : "url");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f5] text-zinc-800">
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        historyCount={history.length}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {activePage === "dashboard" && (
          <Dashboard
            stats={stats}
            recentScans={history}
            onNavigate={setActivePage}
            onScanComplete={handleScanComplete}
          />
        )}

        {activePage === "scanner" && (
          <ScannerPage onScanComplete={handleScanComplete} defaultTab="qr" />
        )}

        {activePage === "manual" && (
          <ScannerPage onScanComplete={handleScanComplete} defaultTab="url" />
        )}

        {activePage === "history" && (
          <HistoryPage
            history={history}
            onClearHistory={clearHistory}
            onRemoveItem={removeScan}
          />
        )}

        {activePage === "learn" && <LearnPage />}

        {activePage === "about" && <AboutPage />}
      </main>

      <Footer />
    </div>
  );
}
