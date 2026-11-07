import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Navbar from "./components/Navbar";
import ScanWorkspace from "./components/ScanWorkspace";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f4f7f5] text-zinc-800">
      <Navbar />
      <main>
        <Hero />
        <ScanWorkspace />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
