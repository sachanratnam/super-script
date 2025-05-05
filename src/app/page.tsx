
import { ReelGeneratorForm } from "@/components/reel-generator-form";

export default function Home() {
  return (
    // Adjusted padding and gradient for Material Design feel
     <div className="min-h-screen bg-gradient-to-br from-background to-secondary/15 dark:from-zinc-900 dark:to-zinc-950 flex flex-col items-center pt-10 pb-16 px-4 sm:px-6 lg:px-8">
       {/* Header styling adjusted */}
      <header className="text-center mb-10 max-w-4xl">
         <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4 tracking-tight"> {/* Use primary color */}
          SuperScripts
        </h1>
         <p className="text-lg sm:text-xl text-muted-foreground/90 leading-relaxed max-w-2xl mx-auto">
          Get tailored Instagram reel scripts crafted from extensive market research. Define your topic, tone, and goals to receive engaging content designed for maximum impact.
        </p>
      </header>
      {/* Main content area directly uses ReelGeneratorForm */}
      <main className="w-full max-w-7xl px-0 md:px-4">
        <ReelGeneratorForm />
      </main>
       {/* Removed the footer section */}
    </div>
  );
}
