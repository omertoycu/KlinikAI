import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import BentoFeatures from "@/components/landing/BentoFeatures";
import Services from "@/components/landing/Services";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenChat={() => setChatOpen(true)} />
      <main>
        <Hero onOpenChat={() => setChatOpen(true)} />
        <BentoFeatures />
        <Services onOpenChat={() => setChatOpen(true)} />
        <Testimonials />
      </main>
      <Footer />
      <ChatWidget isOpen={chatOpen} onClose={() => setChatOpen(false)} onOpen={() => setChatOpen(true)} />
    </div>
  );
}
