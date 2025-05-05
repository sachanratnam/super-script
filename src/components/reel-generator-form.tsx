
"use client";

import { useState, useEffect } from "react";
import type { GenerateReelScriptsInput, GenerateReelScriptsOutput } from "@/ai/flows/generate-reel-scripts";
import { generateReelScripts } from "@/ai/flows/generate-reel-scripts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, AlertTriangle, Sparkles, ClipboardCopy, Share2 } from "lucide-react"; // Added Share2
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// --- Language Data ---
const allLanguages = [
  "English", "Hindi", "Bengali", "Telugu", "Tamil", "Marathi", "Gujarati", "Urdu", "Kannada",
  "Odia", "Malayalam", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch",
  "Russian", "Japanese", "Chinese (Simplified)", "Korean", "Arabic",
];

const indianLanguages = [
  "Hindi", "Bengali", "Telugu", "Tamil", "Marathi", "Gujarati", "Urdu", "Kannada",
  "Odia", "Malayalam",
];

// --- End Language Data ---


// M3 Inspired Styling Adjustments (Applied via globals.css)

const formSchema = z.object({
  topic: z.string().min(10, { message: "Topic needs more detail (min 10 chars)." }).max(250, { message: "Topic too long (max 250 chars)." }),
  length: z.enum(["15s", "30s", "60s", "90s"]),
  language: z.string().min(1, { message: "Please select a language." }),
  tone: z.string().min(1, { message: "Please select a tone." }),
  objective: z.string().min(1, { message: "Please select an objective." }),
});

const tones = [
    "Humorous", "Witty", "Sarcastic", "Playful",
    "Motivational", "Inspirational", "Uplifting", "Empowering",
    "Educational", "Informative", "Authoritative", "Thought-provoking",
    "Dramatic", "Suspenseful", "Emotional", "Romantic",
    "Casual", "Friendly", "Conversational", "Authentic",
    "Formal", "Professional", "Polished",
    "Excited", "Energetic", "Passionate",
    "Calm", "Relaxing", "Soothing",
];

const objectives = [
    "Increase brand awareness", "Go viral", "Maximize reach",
    "Drive sales", "Promote a product/service", "Generate leads",
    "Educate audience", "Share tips/tutorials", "Explain a concept",
    "Build community", "Increase engagement", "Start a conversation",
    "Entertain viewers", "Tell a story", "Showcase creativity",
];

export function ReelGeneratorForm() {
  const [generatedScripts, setGeneratedScripts] = useState<GenerateReelScriptsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // State for dynamic language sorting and default
  const [sortedLanguages, setSortedLanguages] = useState<string[]>(() => {
    // Simple initial sort: English first, then Indian languages, then others
    const otherIndian = indianLanguages.filter(l => l !== 'English').sort();
    const others = allLanguages.filter(l => l !== 'English' && !indianLanguages.includes(l)).sort();
    return ['English', ...otherIndian, ...others];
  });
  const [defaultLanguage, setDefaultLanguage] = useState<string>("English"); // Default to English

  // --- State for Script Generation Progress (for loader) ---
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      length: "30s",
      language: defaultLanguage, // Set initial default
      tone: "Motivational",
      objective: "Increase engagement",
    },
  });

   // --- Effect for setting default language (Client-Side Only) ---
  useEffect(() => {
    // This effect runs only once on the client after hydration
    // We set the default language here to avoid hydration mismatch
    // if server default differs from potential future client-side detection
    form.setValue('language', defaultLanguage, { shouldValidate: false, shouldDirty: false });

  // Only run once on mount
  }, [defaultLanguage, form]);

  useEffect(() => {
    console.log("Rendered");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // --- Simulate progress updates ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      setLoadingMessage("Analyzing market data..."); // Updated message
      interval = setInterval(() => {
          const messages = [
            "Analyzing market data...",
            "Identifying viral trends...",
            "Developing script strategies...",
            "Refining for maximum engagement...",
            "Cross-referencing audience psychology...",
            "Optimizing for platform algorithms...",
          ];
          // Cycle through messages
          setLoadingMessage(prev => {
            const currentIndex = messages.indexOf(prev);
            const nextIndex = (currentIndex + 1) % messages.length;
            return messages[nextIndex];
          });
      }, 1800); // Adjust interval speed as needed for the loop feeling
    } else {
      if (interval) clearInterval(interval);
       setLoadingMessage("Ready!"); // Updated message
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setGeneratedScripts(null);

    try {
      const input: GenerateReelScriptsInput = values;
      const result = await generateReelScripts(input);

       // Basic check if scripts array is empty or undefined
       if (!result || !result.scripts || result.scripts.length === 0) {
           throw new Error("No scripts were generated. The generation process might have encountered an unexpected issue.");
       }

      setGeneratedScripts(result);
       toast({ // Success toast
          title: "Scripts Crafted!",
          description: "Your high-impact reel scripts are ready.",
          variant: "default", // Use default variant for success
        });
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error generating scripts:", errorMessage);
       // User-friendly error message, masking potential internal issues
       setError("Hmm, couldn't quite generate scripts with that. Could you try rephrasing your topic or adjusting the settings? Sometimes a different approach sparks more creativity!");
       toast({ // Error toast
          title: "Generation Issue",
           description: "Please refine your input and try again.",
          variant: "destructive",
        });
    } finally {
       setIsLoading(false);
    }
  }

  const handleCopy = (script: string, index: number) => {
     // Check if navigator.clipboard is available (client-side check)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(script)
        .then(() => {
            toast({
              title: `Script ${index + 1} Copied!`,
              description: "Ready to paste and create.",
            });
        })
        .catch(err => {
            console.error("Copy failed:", err);
            toast({
                title: "Copy Failed",
                description: "Could not copy script to clipboard.",
                variant: "destructive",
            });
        });
    } else {
      // Fallback or error message if clipboard API is not available
       toast({
        title: "Copy Failed",
        description: "Clipboard access is not available in this browser.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (script: string, index: number) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Reel Script ${index + 1}`,
          text: script,
          // url: window.location.href, // Optionally share the URL of the page
        });
        toast({
          title: "Script Shared!",
          description: "Successfully shared the script.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Don't show error if user cancels share dialog ('AbortError')
        if ((error as DOMException)?.name !== 'AbortError') {
          toast({
            title: "Share Failed",
            description: "Could not share the script.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      handleCopy(script, index); // Copy to clipboard as fallback
      toast({
        title: "Share Not Supported",
        description: "Web Share API not available. Script copied instead!",
        duration: 4000, // Show for a bit longer
      });
    }
  };


  return (
     // Use flex layout for desktop, column layout for mobile
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full bg-transparent">

      {/* Left Column / Top Section: Form */}
       <div className="w-full lg:w-2/5 flex-shrink-0">
         {/* Card styling adjusted for Material Design feel */}
        <Card className="shadow-lg border-border/30 bg-card rounded-2xl overflow-hidden">
           {/* Header styling adjusted */}
           <CardHeader className="p-6 pb-4 bg-gradient-to-br from-card to-muted/30 dark:from-card dark:to-muted/10">
             <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2.5"> {/* Use primary color */}
                <Sparkles className="w-6 h-6" />
                Craft Your Reel Script
             </CardTitle>
            <CardDescription className="text-muted-foreground/90 pt-1.5">
               Fill in the details below for engaging scripts developed from market research.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
               {/* Content styling adjusted */}
              <CardContent className="p-6 space-y-5">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-foreground/90">Reel Topic</FormLabel>
                      <FormControl>
                        {/* Textarea styling adjusted */}
                        <Textarea
                          placeholder="Describe the core idea... e.g., 'Quick 3-ingredient healthy snacks for busy mornings'"
                          {...field}
                          className="min-h-[110px] resize-none bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner" // Use input background, add shadow
                          suppressHydrationWarning // Keep suppression for potential client/server differences in initial empty state
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-foreground/90">Length</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                             {/* Select styling adjusted */}
                             <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner">
                              <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                          </FormControl>
                           <SelectContent className="rounded-lg shadow-xl"> {/* Adjust dropdown style */}
                            {["15s", "30s", "60s", "90s"].map((len) => (
                              <SelectItem key={len} value={len} className="rounded-md">
                                {len}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-foreground/90">Language</FormLabel>
                         {/* Ensure Select uses key prop for proper re-renders when default value changes */}
                        <Select
                          key={defaultLanguage} // Use defaultLanguage as key
                          onValueChange={field.onChange}
                          value={field.value} // Controlled component
                          // defaultValue={defaultLanguage} // defaultValue can cause hydration issues if client differs
                          >
                          <FormControl>
                            <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                            <SelectContent className="rounded-lg shadow-xl">
                              <ScrollArea className="h-[220px]">
                                {sortedLanguages.map((lang) => (
                                  <SelectItem key={lang} value={lang} className="rounded-md">
                                    {lang}
                                  </SelectItem>
                                ))}
                              </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-foreground/90">Tone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                             <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner">
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                          </FormControl>
                           <SelectContent className="rounded-lg shadow-xl">
                             <ScrollArea className="h-[220px]">
                              {tones.sort().map((t) => (
                                <SelectItem key={t} value={t} className="rounded-md">
                                  {t}
                                </SelectItem>
                              ))}
                             </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="objective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-foreground/90">Objective</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                             <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner">
                              <SelectValue placeholder="Select objective" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-lg shadow-xl">
                             <ScrollArea className="h-[220px]">
                              {objectives.sort().map((obj) => (
                                <SelectItem key={obj} value={obj} className="rounded-md">
                                  {obj}
                                </SelectItem>
                              ))}
                              </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
               {/* Footer styling adjusted */}
              <CardFooter className="p-6 pt-4 flex justify-end bg-muted/30 dark:bg-muted/20 border-t border-border/30">
                 {/* Button styling adjusted */}
                 <Button type="submit" disabled={isLoading} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 shadow-md hover:shadow-lg transition-shadow duration-300">
                   {isLoading ? (
                     <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                     <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Scripts
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      {/* Right Column / Bottom Section: Results */}
       {/* Ensure this column takes available space */}
       <div className="w-full lg:w-3/5 flex-grow flex flex-col">
         {/* Card styling adjusted, ensure it grows */}
         <Card className="shadow-lg flex-grow flex flex-col border border-border/30 bg-card rounded-2xl overflow-hidden">
           {/* Header styling adjusted */}
          <CardHeader className="p-6 pb-3 border-b border-border/30">
             <CardTitle className="text-xl font-semibold text-foreground/90 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" /> {/* Use primary color */}
                 Your Tailored Reel Scripts
             </CardTitle>
             <CardDescription className="text-muted-foreground/90 pt-1.5">
                 Here are the scripts developed from market research based on your input. Review, copy, and start creating!
             </CardDescription>
          </CardHeader>
           {/* Make CardContent scrollable internally */}
           <CardContent className="flex-grow overflow-hidden p-0 flex">
             {/* Container for states: loading, error, results, initial */}
             {/* Use relative positioning for absolutely positioned results */}
              {/* Add min-height to ensure space for content on mobile */}
              <div className="flex-grow flex flex-col justify-center items-center w-full bg-muted/20 dark:bg-muted/10 p-6 relative min-h-[400px]"> {/* Ensure min-height */}
              <AnimatePresence mode="wait">
                {error && (
                   <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full max-w-lg text-center"
                    >
                      {/* Alert styling adjusted */}
                     <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-lg shadow-inner">
                       <AlertTriangle className="h-5 w-5 text-destructive" />
                       <AlertTitle className="font-semibold">Generation Issue</AlertTitle>
                       <AlertDescription className="text-destructive/90">
                         {error}
                       </AlertDescription>
                     </Alert>
                   </motion.div>
                )}

                {isLoading && (
                   <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center text-center space-y-4 text-primary"
                    >
                      {/* Enhanced Loader - Orbiting and Pulsing */}
                      <div className="relative w-20 h-20">
                         {/* Orbiting circles */}
                         <motion.div
                           className="absolute inset-0 border-4 border-primary/20 rounded-full"
                           initial={{ scale: 0.8, opacity: 0.5 }}
                           animate={{ scale: 1.1, opacity: 0 }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                         />
                         <motion.div
                           className="absolute inset-2 border-4 border-primary/30 rounded-full"
                           initial={{ scale: 0.9, opacity: 0.7 }}
                           animate={{ scale: 1.05, opacity: 0.2 }}
                           transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                         />
                         <motion.div
                           className="absolute inset-4 border-4 border-primary/40 rounded-full"
                           initial={{ scale: 1, opacity: 0.9 }}
                           animate={{ scale: 0.95, opacity: 0.4 }}
                           transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                         />
                          {/* Central pulsing icon */}
                         <motion.div
                           className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut"}}
                         >
                            <Sparkles className="w-10 h-10 text-primary opacity-90" />
                         </motion.div>
                      </div>
                      <p className="text-lg font-medium text-foreground/80 pt-4">{loadingMessage}</p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                          Building your scripts for maximum impact... please wait.
                      </p>
                  </motion.div>
                )}

                 {!isLoading && generatedScripts && generatedScripts.scripts.length > 0 && (
                   <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      // Make this div absolute to overlay within the parent
                      className="absolute inset-0 p-6" // Apply padding here
                    >
                     {/* ScrollArea now takes full height of its absolute parent and handles internal scrolling */}
                     <ScrollArea className="h-full w-full pr-1"> {/* Adjust pr for scrollbar visibility */}
                      <div className="space-y-6 pb-6"> {/* Add padding-bottom inside scroll area */}
                        {generatedScripts.scripts.map((script, index) => (
                           // Card styling for each script
                          <Card key={index} className="bg-background shadow-sm border border-border/50 overflow-hidden rounded-xl">
                             {/* Header for script number and action buttons */}
                             <CardHeader className="p-4 pb-2 bg-muted/30 dark:bg-muted/15 border-b border-border/50 flex flex-row items-center justify-between">
                               <CardTitle className="text-base font-semibold text-primary">
                                 Script {index + 1}
                              </CardTitle>
                               {/* Action buttons */}
                               <div className="flex items-center space-x-2">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleCopy(script, index)}
                                    aria-label={`Copy script ${index + 1}`}
                                  >
                                    <ClipboardCopy className="h-4 w-4" />
                                  </Button>
                                   {/* Share button visible only if navigator.share is available */}
                                   {typeof navigator !== 'undefined' && navigator.share && (
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                          onClick={() => handleShare(script, index)}
                                          aria-label={`Share script ${index + 1}`}
                                        >
                                          <Share2 className="h-4 w-4" />
                                        </Button>
                                   )}
                               </div>
                            </CardHeader>
                             {/* Script content */}
                            <CardContent className="p-4">
                               {/* Use pre-wrap for better line break handling */}
                               <p className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{script}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                   </motion.div>
                )}

                {/* Initial placeholder state */}
                {!isLoading && !generatedScripts && !error && (
                   <motion.div
                      key="initial"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground/70"
                    >
                     <Sparkles className="w-16 h-16 opacity-40" />
                     <p className="text-xl font-medium">Ready for Results</p>
                     <p className="text-sm max-w-sm">Your tailored Instagram reel scripts, backed by market insights, will appear here once you provide the details and click 'Generate'.</p>
                  </motion.div>
                )}
              </AnimatePresence>
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
