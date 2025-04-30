import { ReelGeneratorForm } from "@/components/reel-generator-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">ReelGenius AI</h1>
        <p className="text-lg text-muted-foreground">
          Your expert Instagram growth consultant for viral reel scripts.
        </p>
      </header>
      <main className="w-full max-w-3xl">
        <ReelGeneratorForm />
      </main>
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        Built with ❤️ using Next.js, ShadCN UI, and Genkit.
      </footer>
    </div>
  );
}
