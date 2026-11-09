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
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const { history, addScan, removeScan, clearHistory, stats } = useScanHistory();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activePage]);

  const handleScanComplete = (result: BackendScanResponse) => {
    addScan(result, activePage === "scanner" ? "qr" : "url");
  };

  return (
    <div className={`cs-app-frame flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased selection:bg-teal-500/20 selection:text-teal-200 ${activePage === "dashboard" ? "cs-dashboard-frame" : ""}`}>
      <a className="skip-link" href="#content">Skip to content</a>
      <div className="flex min-h-0 flex-1">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          historyCount={history.length}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            key={activePage}
            activePage={activePage}
            onNavigate={setActivePage}
            historyCount={history.length}
          />
          <main id="content" tabIndex={-1} className="mx-auto min-h-0 w-full max-w-none flex-1 px-4 py-4 sm:px-6 lg:px-5 lg:pb-8 lg:pt-4 xl:pb-5 xl:pl-8 xl:pr-3">
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
        </div>
      </div>
      <Footer onNavigate={setActivePage} privacyOpen={privacyOpen} onPrivacyOpenChange={setPrivacyOpen} />
    </div>
  );
}
