
"use client";

import { useState, useEffect } from "react";
import type { GenerateReelScriptsInput, GenerateReelScriptsOutput } from "@/ai/flows/generate-reel-scripts";
import { generateReelScripts } from "@/ai/flows/generate-reel-scripts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, AlertTriangle, Sparkles, Bot, ClipboardCopy } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// --- Language Data & Logic ---
const allLanguages = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch",
  "Russian", "Japanese", "Chinese (Simplified)", "Korean", "Arabic", "Hindi",
  "Bengali", "Telugu", "Tamil", "Marathi", "Gujarati", "Urdu", "Kannada",
  "Odia", "Malayalam",
];

const indianLanguages = [
  "Hindi", "Bengali", "Telugu", "Tamil", "Marathi", "Gujarati", "Urdu", "Kannada",
  "Odia", "Malayalam",
];

// Simple mapping from language code prefix to language name in our list
const languageCodeMap: { [key: string]: string } = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
  nl: "Dutch",
  ru: "Russian",
  ja: "Japanese",
  zh: "Chinese (Simplified)",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  bn: "Bengali",
  te: "Telugu",
  ta: "Tamil",
  mr: "Marathi",
  gu: "Gujarati",
  ur: "Urdu",
  kn: "Kannada",
  or: "Odia",
  ml: "Malayalam",
};

const sortLanguages = (detectedLang: string | null): string[] => {
  const detectedLangName = detectedLang && allLanguages.includes(detectedLang) ? detectedLang : "English";
  const otherIndianLanguages = indianLanguages.filter(lang => lang !== detectedLangName);
  const remainingLanguages = allLanguages.filter(
    lang => lang !== detectedLangName && !indianLanguages.includes(lang)
  ).sort();

  return [
    detectedLangName,
    ...otherIndianLanguages.sort(),
    ...remainingLanguages,
  ];
};
// --- End Language Data & Logic ---


// M3 Inspired Styling Adjustments

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
  const [sortedLanguages, setSortedLanguages] = useState<string[]>(() => sortLanguages(null)); // Initial sort with English default
  const [defaultLanguage, setDefaultLanguage] = useState<string>("English");

  // --- State for Script Generation Progress (for loader) ---
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Default values will be updated by useEffect
    defaultValues: {
      topic: "",
      length: "30s",
      language: "", // Initialize as empty, will be set by useEffect
      tone: "Motivational",
      objective: "Increase engagement",
    },
  });

   // --- Effect for Language Detection and Sorting (Client-Side Only) ---
  useEffect(() => {
    let detectedLangName = "English"; // Default
    try {
      const browserLang = navigator.language?.split('-')[0]; // Get primary language code (e.g., 'en' from 'en-US')
      if (browserLang && languageCodeMap[browserLang] && allLanguages.includes(languageCodeMap[browserLang])) {
        detectedLangName = languageCodeMap[browserLang];
      }
    } catch (e) {
      console.warn("Could not detect browser language:", e);
      // Fallback to English if detection fails
      detectedLangName = "English";
    }


    setDefaultLanguage(detectedLangName);
    setSortedLanguages(sortLanguages(detectedLangName));

    // Reset the form with the detected language as default
    form.reset({
      ...form.getValues(), // Keep other current values
      language: detectedLangName, // Set the detected language
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount

  // --- Simulate progress updates ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      setProgress(0); // Reset progress on new generation
      setLoadingMessage("Warming up the AI...");
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) {
            setLoadingMessage("Analyzing your request...");
            return prev + 5;
          } else if (prev < 70) {
            setLoadingMessage("Crafting script ideas...");
            return prev + 4;
          } else if (prev < 95) {
            setLoadingMessage("Refining and polishing...");
            return prev + 2;
          } else {
            setLoadingMessage("Finalizing scripts..."); // Keep at 95-99 until done
            return Math.min(prev + 1, 99);
          }
        });
      }, 400); // Adjust interval speed as needed
    } else {
      if (interval) clearInterval(interval);
      setProgress(100); // Ensure it hits 100 when done
      setLoadingMessage("Done!");
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
      setGeneratedScripts(result);
       toast({ // Success toast
          title: "Scripts Generated!",
          description: "Your viral-worthy reel scripts are ready.",
          variant: "default",
        });
    } catch (err) {
      console.error("Error generating scripts:", err);
      setError("Hmm, couldn't quite generate scripts with that. Could you try rephrasing your topic or adjusting the settings? Sometimes a different approach sparks the AI's creativity!");
       toast({ // Error toast
          title: "Generation Failed",
          description: "Please refine your input and try again.",
          variant: "destructive",
        });
    } finally {
       setIsLoading(false);
    }
  }

  const handleCopy = (script: string, index: number) => {
    navigator.clipboard.writeText(script);
    toast({
      title: `Script ${index + 1} Copied!`,
      description: "Ready to paste and create.",
    });
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full bg-transparent">

      {/* Left Column / Top Section: Form */}
      <div className="w-full lg:w-2/5 flex-shrink-0">
        <Card className="shadow-lg border border-border/30 bg-card rounded-2xl overflow-hidden">
           <CardHeader className="p-6 pb-4 bg-primary/5 dark:bg-primary/10">
            <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2.5">
                <Sparkles className="w-6 h-6" />
                Create Your Reel Script
            </CardTitle>
            <CardDescription className="text-muted-foreground/90 pt-1.5">
              Fill in the details below and let AI craft engaging scripts for your next viral hit.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-5">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-foreground/90">Reel Topic</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the core idea... e.g., 'Quick 3-ingredient healthy snacks for busy mornings'"
                          {...field}
                          className="min-h-[110px] resize-none bg-background focus:bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
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
                            <SelectTrigger className="bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg">
                              <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["15s", "30s", "60s", "90s"].map((len) => (
                              <SelectItem key={len} value={len}>
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
                          key={defaultLanguage} // Add key here
                          onValueChange={field.onChange}
                          defaultValue={field.value || defaultLanguage} // Use form value or detected default
                          value={field.value || defaultLanguage} // Control the value explicitly
                          disabled={!form.formState.isDirty && !field.value} // Disable until useEffect sets value or user interacts
                          >
                          <FormControl>
                           <SelectTrigger className="bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                           <SelectContent>
                              <ScrollArea className="h-[220px]">
                                {/* Render sorted languages */}
                                {sortedLanguages.map((lang) => (
                                  <SelectItem key={lang} value={lang}>
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
                            <SelectTrigger className="bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg">
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                          </FormControl>
                           <SelectContent>
                             <ScrollArea className="h-[220px]">
                              {tones.sort().map((t) => (
                                <SelectItem key={t} value={t}>
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
                             <SelectTrigger className="bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg">
                              <SelectValue placeholder="Select objective" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             <ScrollArea className="h-[220px]">
                              {objectives.sort().map((obj) => (
                                <SelectItem key={obj} value={obj}>
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
              <CardFooter className="p-6 pt-4 flex justify-end bg-muted/30 dark:bg-muted/20 border-t border-border/30">
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
       <div className="w-full lg:w-3/5 flex-grow flex flex-col">
        <Card className="shadow-lg flex-grow flex flex-col border border-border/30 bg-card rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-3 border-b border-border/30">
             <CardTitle className="text-xl font-semibold text-foreground/90 flex items-center gap-2">
                <Bot className="w-6 h-6 text-primary" />
                AI Generated Scripts
            </CardTitle>
             <CardDescription className="text-muted-foreground/90 pt-1.5">
               Here are the scripts generated based on your input. Review, copy, and create!
             </CardDescription>
          </CardHeader>
           <CardContent className="flex-grow overflow-hidden p-0 flex">
             {/* Container for states: loading, error, results, initial */}
             <div className="flex-grow flex flex-col justify-center items-center h-full w-full bg-muted/20 dark:bg-muted/10 p-6">
              <AnimatePresence mode="wait">
                {error && (
                   <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full max-w-lg text-center"
                    >
                     <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-lg">
                       <AlertTriangle className="h-5 w-5 text-destructive" />
                       <AlertTitle className="font-semibold">Generation Failed</AlertTitle>
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
                      {/* Enhanced Loader */}
                      <div className="relative w-20 h-20">
                         <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-pulse"></div>
                         <Loader2 className="absolute inset-2 w-16 h-16 text-primary animate-spin" />
                         <Sparkles className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 text-primary opacity-90" />
                      </div>
                      {/* Progress Bar */}
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mt-4">
                           <motion.div
                             className="h-full bg-primary rounded-full"
                             initial={{ width: 0 }}
                             animate={{ width: `${progress}%` }}
                             transition={{ duration: 0.4, ease: "linear" }}
                           />
                      </div>
                      <p className="text-lg font-medium text-foreground/80 pt-2">{loadingMessage}</p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                          Crafting scripts that aim for maximum engagement... please wait.
                      </p>
                  </motion.div>
                )}

                 {!isLoading && generatedScripts && generatedScripts.scripts.length > 0 && (
                   <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full w-full"
                    >
                     <ScrollArea className="h-full w-full p-1 pr-4">
                      <div className="space-y-6">
                        {generatedScripts.scripts.map((script, index) => (
                          <Card key={index} className="bg-background shadow-sm border border-border/50 overflow-hidden rounded-xl relative group">
                             <CardHeader className="p-4 pb-2 bg-muted/30 dark:bg-muted/15 border-b border-border/50 flex flex-row items-center justify-between">
                               <CardTitle className="text-base font-semibold text-primary">
                                 Script {index + 1}
                              </CardTitle>
                               <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                                  onClick={() => handleCopy(script, index)}
                                  aria-label={`Copy script ${index + 1}`}
                                >
                                  <ClipboardCopy className="h-4 w-4" />
                               </Button>
                            </CardHeader>
                            <CardContent className="p-4">
                               <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{script}</pre>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                   </motion.div>
                )}

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
                     <p className="text-sm max-w-sm">Your AI-generated Instagram reel scripts will appear here once you provide the details and click 'Generate'.</p>
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

// Helper component for smoother animations with AnimatePresence (Optional, kept for consistency)
const MotionCard = motion(Card);
const MotionScrollArea = motion(ScrollArea);
const MotionDiv = motion.div;
