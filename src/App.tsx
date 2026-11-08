import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activePage]);

  const handleScanComplete = (result: BackendScanResponse) => {
    addScan(result, activePage === "scanner" ? "qr" : "url");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-teal-500/20 selection:text-teal-200">
      <a className="skip-link" href="#content">Skip to content</a>
      <Navbar
        key={activePage}
        activePage={activePage}
        onNavigate={setActivePage}
        historyCount={history.length}
      />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          historyCount={history.length}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
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

            {(activePage === "history" || activePage === "reports") && (
              <HistoryPage
                history={history}
                onClearHistory={clearHistory}
                onRemoveItem={removeScan}
                reportView={activePage === "reports"}
              />
            )}

            {activePage === "learn" && <LearnPage />}

            {activePage === "about" && <AboutPage />}
          </main>

          <Footer onNavigate={setActivePage} />
        </div>
      </div>
    </div>
  );
}
