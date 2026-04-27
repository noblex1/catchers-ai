import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);
