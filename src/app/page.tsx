
import { ReelGeneratorForm } from "@/components/reel-generator-form";

export default function Home() {
  return (
    // Adjusted padding after removing header
     <div className="min-h-screen bg-background flex flex-col items-center pt-8 pb-16 px-4 sm:px-6 lg:px-8">
       {/* Header removed */}
      {/*
      <header className="text-center mb-10 max-w-4xl">
         <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4 tracking-tight">
          SuperScripts
        </h1>
         <p className="text-lg sm:text-xl text-muted-foreground/90 leading-relaxed max-w-2xl mx-auto">
          Get tailored Instagram reel scripts crafted from extensive market research. Define your topic, tone, and goals to receive engaging content designed for maximum impact.
        </p>
      </header>
      */}
      {/* Main content area directly uses ReelGeneratorForm */}
      <main className="w-full max-w-7xl px-0 md:px-4">
        <ReelGeneratorForm />
      </main>
    </div>
  );
}
