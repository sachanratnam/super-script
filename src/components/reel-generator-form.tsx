
"use client";

import { useState, useEffect, useRef } from "react";
import type { GenerateReelScriptsInput, GenerateReelScriptsOutput } from "@/ai/flows/generate-reel-scripts";
import { generateReelScripts } from "@/ai/flows/generate-reel-scripts";
import type { RefineScriptInput, RefineScriptOutput } from "@/ai/flows/refine-script-flow"; // Import refinement types
import { refineScript } from "@/ai/flows/refine-script-flow"; // Import refinement flow

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, AlertTriangle, Sparkles, ClipboardCopy, Share2, Edit3, Send, ChevronsDown, ChevronsUp } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";


const allLanguages = [
  "English", "Hindi", "Bengali", "Telugu", "Tamil", "Marathi", "Gujarati", "Urdu", "Kannada",
  "Odia", "Malayalam", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch",
  "Russian", "Japanese", "Chinese (Simplified)", "Korean", "Arabic",
];

const indianLanguages = [
  "Hindi", "Bengali", "Telugu", "Tamil", "Marathi", "Gujarati", "Urdu", "Kannada",
  "Odia", "Malayalam",
];

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

// --- Schema for Refinement Form ---
const refinementFormSchema = z.object({
  refinementType: z.enum(["CONCISE", "DETAILED", "CHANGE_TONE", "ENHANCE_CTA"]),
  newTone: z.string().optional(),
  ctaFocus: z.string().optional(),
});
type RefinementFormValues = z.infer<typeof refinementFormSchema>;


export function ReelGeneratorForm() {
  const [generatedScripts, setGeneratedScripts] = useState<GenerateReelScriptsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [sortedLanguages, setSortedLanguages] = useState<string[]>(() => {
    const otherIndian = indianLanguages.filter(l => l !== 'English').sort();
    const others = allLanguages.filter(l => l !== 'English' && !indianLanguages.includes(l)).sort();
    return ['English', ...otherIndian, ...others];
  });
  const [defaultLanguage, setDefaultLanguage] = useState<string>("English");

  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  // --- State for Script Refinement ---
  const [selectedScriptToRefine, setSelectedScriptToRefine] = useState<string | null>(null);
  const [selectedScriptContext, setSelectedScriptContext] = useState<GenerateReelScriptsInput | null>(null);
  const [isRefiningScript, setIsRefiningScript] = useState(false);
  const [refinementError, setRefinementError] = useState<string | null>(null);
  const [refinedScriptResult, setRefinedScriptResult] = useState<string | null>(null);
  const [showRefinementSection, setShowRefinementSection] = useState(false);
  const refinementSectionRef = useRef<HTMLDivElement>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      length: "30s",
      language: defaultLanguage,
      tone: "Motivational",
      objective: "Increase engagement",
    },
  });

  const refinementForm = useForm<RefinementFormValues>({
    resolver: zodResolver(refinementFormSchema),
    defaultValues: {
      refinementType: "CONCISE",
      newTone: "",
      ctaFocus: "",
    },
  });
  const watchRefinementType = refinementForm.watch("refinementType");


  useEffect(() => {
    form.setValue('language', defaultLanguage, { shouldValidate: false, shouldDirty: false });
  }, [defaultLanguage, form]);

  useEffect(() => {
    console.log("Rendered");
  }, []); 

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      setLoadingMessage("Analyzing market data...");
      interval = setInterval(() => {
          const messages = [
            "Analyzing market data...", "Identifying viral trends...", "Developing script strategies...",
            "Refining for maximum engagement...", "Cross-referencing audience psychology...", "Optimizing for platform algorithms...",
          ];
          setLoadingMessage(prev => {
            const currentIndex = messages.indexOf(prev);
            const nextIndex = (currentIndex + 1) % messages.length;
            return messages[nextIndex];
          });
      }, 1800); 
    } else {
      if (interval) clearInterval(interval);
       setLoadingMessage("Ready!");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Animation state for transferring input
  const [isTransferring, setIsTransferring] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setGeneratedScripts(null);
    setShowRefinementSection(false); // Hide refinement section on new generation
    setRefinedScriptResult(null);   // Clear previous refined script

    setIsTransferring(true); // Start transfer animation
    // Simulate transfer time
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setIsTransferring(false); // End transfer animation


    try {
      const input: GenerateReelScriptsInput = values;
      const result = await generateReelScripts(input);
       if (!result || !result.scripts || result.scripts.length === 0) {
           throw new Error("No scripts were generated. The generation process might have encountered an unexpected issue.");
       }
      setGeneratedScripts(result);
      setSelectedScriptContext(values); // Save context for potential refinement
       toast({ 
          title: "Scripts Crafted!", description: "Your high-impact reel scripts are ready.", variant: "default",
        });
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error generating scripts:", errorMessage);
       setError("Hmm, couldn't quite generate scripts with that. Could you try rephrasing your topic or adjusting the settings? Sometimes a different approach sparks more creativity!");
       toast({ 
          title: "Generation Issue", description: "Please refine your input and try again.", variant: "destructive",
        });
    } finally {
       setIsLoading(false);
    }
  }

  const handleSelectScriptForRefinement = (script: string, index: number) => {
    setSelectedScriptToRefine(script);
    setRefinedScriptResult(null); // Clear previous refined script
    setRefinementError(null); // Clear previous refinement error
    setShowRefinementSection(true);
    refinementForm.reset(); // Reset refinement form
    // Scroll to refinement section
    setTimeout(() => {
      refinementSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  async function onRefineSubmit(values: RefinementFormValues) {
    if (!selectedScriptToRefine || !selectedScriptContext) return;

    setIsRefiningScript(true);
    setRefinementError(null);
    setRefinedScriptResult(null);

    let refinementGoal = "";
    switch (values.refinementType) {
      case "CONCISE":
        refinementGoal = "Make the script more concise and shorter.";
        break;
      case "DETAILED":
        refinementGoal = "Add more detail to the script and make it longer, while staying engaging.";
        break;
      case "CHANGE_TONE":
        refinementGoal = `Change the tone of the script to ${values.newTone || selectedScriptContext.tone}.`;
        break;
      case "ENHANCE_CTA":
        refinementGoal = `Enhance the Call to Action. Focus on: ${values.ctaFocus || 'general engagement'}.`;
        break;
    }

    try {
      const input: RefineScriptInput = {
        originalScript: selectedScriptToRefine,
        topic: selectedScriptContext.topic,
        length: selectedScriptContext.length,
        language: selectedScriptContext.language,
        originalTone: selectedScriptContext.tone,
        objective: selectedScriptContext.objective,
        refinementGoal: refinementGoal,
      };
      const result = await refineScript(input);
      if (!result || !result.refinedScript) {
        throw new Error("The refinement process failed to produce a script.");
      }
      setRefinedScriptResult(result.refinedScript);
      toast({ title: "Script Refined!", description: "Your updated script is ready." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error refining script:", errorMessage);
      setRefinementError("Oops! We hit a snag trying to refine that script. Maybe try a different refinement approach?");
      toast({ title: "Refinement Issue", description: "Could not refine the script. Please try again.", variant: "destructive" });
    } finally {
      setIsRefiningScript(false);
    }
  }


  const handleCopy = (script: string, type: "original" | "refined", index?: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(script)
        .then(() => {
            toast({
              title: `${type === "original" ? `Script ${index! + 1}` : "Refined Script"} Copied!`,
              description: "Ready to paste and create.",
            });
        })
        .catch(err => {
            console.error("Copy failed:", err);
            toast({ title: "Copy Failed", description: "Could not copy script to clipboard.", variant: "destructive" });
        });
    } else {
       toast({ title: "Copy Failed", description: "Clipboard access is not available in this browser.", variant: "destructive" });
    }
  };

  const handleShare = async (script: string, type: "original" | "refined", index?: number) => {
    const title = type === "original" ? `Reel Script ${index! + 1}` : "Refined Reel Script";
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: script });
        toast({ title: "Script Shared!", description: "Successfully shared the script." });
      } catch (error) {
        console.error('Error sharing:', error);
        if ((error as DOMException)?.name !== 'AbortError' && (error as DOMException)?.name !== 'NotAllowedError') {
          toast({ title: "Share Failed", description: "Could not share the script.", variant: "destructive" });
        } else if ((error as DOMException)?.name === 'NotAllowedError') {
           toast({ title: "Share Denied", description: "Permission to share was denied. You might need to enable it in your browser settings.", variant: "destructive", duration: 5000 });
        }
      }
    } else {
      handleCopy(script, type, index); 
      toast({ title: "Share Not Supported", description: "Web Share API not available. Script copied instead!", duration: 4000 });
    }
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full bg-transparent">
       <div className="w-full lg:w-2/5 flex-shrink-0">
        <Card className="shadow-lg border-border/30 bg-card rounded-2xl overflow-hidden">
           <CardHeader className="p-6 pb-4 bg-gradient-to-br from-card to-muted/30 dark:from-card dark:to-muted/10">
             <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2.5">
                <Sparkles className="w-6 h-6" />
                Craft Your Reel Script
             </CardTitle>
            <CardDescription className="text-muted-foreground/90 pt-1.5">
               Fill in the details below for engaging scripts developed from market research.
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
                          className="min-h-[110px] resize-none bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner" 
                          suppressHydrationWarning 
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
                             <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner">
                              <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                          </FormControl>
                           <SelectContent className="rounded-lg shadow-xl"> 
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
                        <Select
                          key={defaultLanguage} 
                          onValueChange={field.onChange}
                          value={field.value} 
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
              <CardFooter className="p-6 pt-4 flex justify-end bg-muted/30 dark:bg-muted/20 border-t border-border/30">
                 <Button type="submit" disabled={isLoading || isTransferring} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 shadow-md hover:shadow-lg transition-shadow duration-300">
                   {(isLoading || isTransferring) ? (
                     <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isTransferring ? "Processing..." : "Generating..."}
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

       <div className="w-full lg:w-3/5 flex-grow flex flex-col">
         <Card className="shadow-lg flex-grow flex flex-col border border-border/30 bg-card rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-3 border-b border-border/30">
             <CardTitle className="text-xl font-semibold text-foreground/90 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" /> 
                 Your Tailored Reel Scripts
             </CardTitle>
             <CardDescription className="text-muted-foreground/90 pt-1.5">
                 Here are the scripts developed from market research based on your input. Review, copy, and start creating! Select a script to refine it further.
             </CardDescription>
          </CardHeader>
           <CardContent className="flex-grow overflow-hidden p-0 flex">
              <div className="flex-grow flex flex-col justify-center items-center w-full bg-muted/20 dark:bg-muted/10 p-6 relative min-h-[400px]"> 
              <AnimatePresence mode="wait">
                {error && (
                   <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-lg text-center">
                     <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-lg shadow-inner">
                       <AlertTriangle className="h-5 w-5 text-destructive" />
                       <AlertTitle className="font-semibold">Generation Issue</AlertTitle>
                       <AlertDescription className="text-destructive/90">{error}</AlertDescription>
                     </Alert>
                   </motion.div>
                )}

                {(isLoading || isTransferring) && (
                   <motion.div key="loading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center justify-center text-center space-y-4 text-primary">
                    <AnimatePresence>
                      {isTransferring && (
                        <motion.div
                          key="transferringInput"
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
                          className="flex flex-col items-center"
                        >
                          <Send className="w-12 h-12 text-primary mb-3" />
                          <p className="text-lg font-medium text-foreground/80">Sending your creative brief...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                     {!isTransferring && isLoading && (
                       <motion.div
                        key="generatingContent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.5 } }} // Delay to allow transfer animation to finish
                        className="flex flex-col items-center"
                       >
                          <div className="relative w-20 h-20">
                             <motion.div className="absolute inset-0 border-4 border-primary/20 rounded-full" initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1.1, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
                             <motion.div className="absolute inset-2 border-4 border-primary/30 rounded-full" initial={{ scale: 0.9, opacity: 0.7 }} animate={{ scale: 1.05, opacity: 0.2 }} transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
                             <motion.div className="absolute inset-4 border-4 border-primary/40 rounded-full" initial={{ scale: 1, opacity: 0.9 }} animate={{ scale: 0.95, opacity: 0.4 }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
                             <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut"}} >
                                <Sparkles className="w-10 h-10 text-primary opacity-90" />
                             </motion.div>
                          </div>
                          <p className="text-lg font-medium text-foreground/80 pt-4">{loadingMessage}</p>
                          <p className="text-sm text-muted-foreground max-w-xs">Building your scripts for maximum impact... please wait.</p>
                        </motion.div>
                     )}
                  </motion.div>
                )}

                 {!isLoading && !isTransferring && generatedScripts && generatedScripts.scripts.length > 0 && (
                   <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 p-6">
                     <ScrollArea className="h-full w-full pr-1"> 
                      <div className="space-y-6 pb-6"> 
                        {generatedScripts.scripts.map((script, index) => (
                          <Card key={index} className="bg-background shadow-sm border border-border/50 overflow-hidden rounded-xl">
                             <CardHeader className="p-4 pb-2 bg-muted/30 dark:bg-muted/15 border-b border-border/50 flex flex-row items-center justify-between">
                               <CardTitle className="text-base font-semibold text-primary">Script {index + 1}</CardTitle>
                               <div className="flex items-center space-x-1">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleCopy(script, "original", index)} aria-label={`Copy script ${index + 1}`} >
                                    <ClipboardCopy className="h-4 w-4" />
                                  </Button>
                                   {typeof navigator !== 'undefined' && navigator.share && (
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleShare(script, "original", index)} aria-label={`Share script ${index + 1}`} >
                                          <Share2 className="h-4 w-4" />
                                        </Button>
                                   )}
                                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs text-primary border-primary/50 hover:bg-primary/10" onClick={() => handleSelectScriptForRefinement(script, index)}>
                                    <Edit3 className="h-3 w-3 mr-1.5" /> Refine
                                  </Button>
                               </div>
                            </CardHeader>
                            <CardContent className="p-4">
                               <p className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{script}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                   </motion.div>
                )}

                {!isLoading && !isTransferring && !generatedScripts && !error && (
                   <motion.div key="initial" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground/70">
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

  // --- Refinement Section ---
  return (
    <>
      {/* Initial Form and Results */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full bg-transparent mb-8">
        {/* Left Column / Top Section: Form (same as before) */}
        <div className="w-full lg:w-2/5 flex-shrink-0">
          <Card className="shadow-lg border-border/30 bg-card rounded-2xl overflow-hidden">
            <CardHeader className="p-6 pb-4 bg-gradient-to-br from-card to-muted/30 dark:from-card dark:to-muted/10">
              <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2.5">
                <Sparkles className="w-6 h-6" />
                Craft Your Reel Script
              </CardTitle>
              <CardDescription className="text-muted-foreground/90 pt-1.5">
                Fill in the details below for engaging scripts developed from market research.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="p-6 space-y-5">
                  {/* ... FormFields for topic, length, language, tone, objective ... (same as before) */}
                  <FormField control={form.control} name="topic" render={({ field }) => ( <FormItem> <FormLabel className="font-medium text-foreground/90">Reel Topic</FormLabel> <FormControl> <Textarea placeholder="Describe the core idea... e.g., 'Quick 3-ingredient healthy snacks for busy mornings'" {...field} className="min-h-[110px] resize-none bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner" suppressHydrationWarning /> </FormControl> <FormMessage /> </FormItem> )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField control={form.control} name="length" render={({ field }) => ( <FormItem> <FormLabel className="font-medium text-foreground/90">Length</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner"> <SelectValue placeholder="Select length" /> </SelectTrigger> </FormControl> <SelectContent className="rounded-lg shadow-xl"> {["15s", "30s", "60s", "90s"].map((len) => ( <SelectItem key={len} value={len} className="rounded-md">{len}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="language" render={({ field }) => ( <FormItem> <FormLabel className="font-medium text-foreground/90">Language</FormLabel> <Select key={defaultLanguage} onValueChange={field.onChange} value={field.value} > <FormControl> <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner"> <SelectValue placeholder="Select language" /> </SelectTrigger> </FormControl> <SelectContent className="rounded-lg shadow-xl"> <ScrollArea className="h-[220px]"> {sortedLanguages.map((lang) => ( <SelectItem key={lang} value={lang} className="rounded-md">{lang}</SelectItem> ))} </ScrollArea> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField control={form.control} name="tone" render={({ field }) => ( <FormItem> <FormLabel className="font-medium text-foreground/90">Tone</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner"> <SelectValue placeholder="Select tone" /> </SelectTrigger> </FormControl> <SelectContent className="rounded-lg shadow-xl"> <ScrollArea className="h-[220px]"> {tones.sort().map((t) => ( <SelectItem key={t} value={t} className="rounded-md">{t}</SelectItem> ))} </ScrollArea> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="objective" render={({ field }) => ( <FormItem> <FormLabel className="font-medium text-foreground/90">Objective</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner"> <SelectValue placeholder="Select objective" /> </SelectTrigger> </FormControl> <SelectContent className="rounded-lg shadow-xl"> <ScrollArea className="h-[220px]"> {objectives.sort().map((obj) => ( <SelectItem key={obj} value={obj} className="rounded-md">{obj}</SelectItem> ))} </ScrollArea> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-4 flex justify-end bg-muted/30 dark:bg-muted/20 border-t border-border/30">
                  <Button type="submit" disabled={isLoading || isTransferring} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 shadow-md hover:shadow-lg transition-shadow duration-300">
                    {(isLoading || isTransferring) ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{isTransferring ? "Processing..." : "Generating..."}</>) : (<><Sparkles className="mr-2 h-5 w-5" />Generate Scripts</>)}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        {/* Right Column / Bottom Section: Results (same as before) */}
        <div className="w-full lg:w-3/5 flex-grow flex flex-col">
          <Card className="shadow-lg flex-grow flex flex-col border border-border/30 bg-card rounded-2xl overflow-hidden">
            <CardHeader className="p-6 pb-3 border-b border-border/30">
              <CardTitle className="text-xl font-semibold text-foreground/90 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Your Tailored Reel Scripts
              </CardTitle>
              <CardDescription className="text-muted-foreground/90 pt-1.5">
                Here are the scripts developed from market research. Review, copy, and create! Select a script to refine it further.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0 flex">
              <div className="flex-grow flex flex-col justify-center items-center w-full bg-muted/20 dark:bg-muted/10 p-6 relative min-h-[400px]">
                <AnimatePresence mode="wait">
                  {error && ( <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-lg text-center"> <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-lg shadow-inner"> <AlertTriangle className="h-5 w-5 text-destructive" /> <AlertTitle className="font-semibold">Generation Issue</AlertTitle> <AlertDescription className="text-destructive/90">{error}</AlertDescription> </Alert> </motion.div> )}
                  {(isLoading || isTransferring) && ( <motion.div key="loading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center justify-center text-center space-y-4 text-primary"> <AnimatePresence> {isTransferring && ( <motion.div key="transferringInput" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }} className="flex flex-col items-center"> <Send className="w-12 h-12 text-primary mb-3" /> <p className="text-lg font-medium text-foreground/80">Sending your creative brief...</p> </motion.div> )} </AnimatePresence> {!isTransferring && isLoading && ( <motion.div key="generatingContent" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }} className="flex flex-col items-center"> <div className="relative w-20 h-20"> <motion.div className="absolute inset-0 border-4 border-primary/20 rounded-full" initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1.1, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} /> <motion.div className="absolute inset-2 border-4 border-primary/30 rounded-full" initial={{ scale: 0.9, opacity: 0.7 }} animate={{ scale: 1.05, opacity: 0.2 }} transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} /> <motion.div className="absolute inset-4 border-4 border-primary/40 rounded-full" initial={{ scale: 1, opacity: 0.9 }} animate={{ scale: 0.95, opacity: 0.4 }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} /> <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut"}} > <Sparkles className="w-10 h-10 text-primary opacity-90" /> </motion.div> </div> <p className="text-lg font-medium text-foreground/80 pt-4">{loadingMessage}</p> <p className="text-sm text-muted-foreground max-w-xs">Building your scripts for maximum impact... please wait.</p> </motion.div> )} </motion.div> )}
                  {!isLoading && !isTransferring && generatedScripts && generatedScripts.scripts.length > 0 && ( <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 p-6"> <ScrollArea className="h-full w-full pr-1"> <div className="space-y-6 pb-6"> {generatedScripts.scripts.map((script, index) => ( <Card key={index} className="bg-background shadow-sm border border-border/50 overflow-hidden rounded-xl"> <CardHeader className="p-4 pb-2 bg-muted/30 dark:bg-muted/15 border-b border-border/50 flex flex-row items-center justify-between"> <CardTitle className="text-base font-semibold text-primary">Script {index + 1}</CardTitle> <div className="flex items-center space-x-1"> <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleCopy(script, "original", index)} aria-label={`Copy script ${index + 1}`} > <ClipboardCopy className="h-4 w-4" /> </Button> {typeof navigator !== 'undefined' && navigator.share && ( <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleShare(script, "original", index)} aria-label={`Share script ${index + 1}`} > <Share2 className="h-4 w-4" /> </Button> )} <Button variant="outline" size="sm" className="h-8 px-3 text-xs text-primary border-primary/50 hover:bg-primary/10" onClick={() => handleSelectScriptForRefinement(script, index)}> <Edit3 className="h-3 w-3 mr-1.5" /> Refine </Button> </div> </CardHeader> <CardContent className="p-4"> <p className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{script}</p> </CardContent> </Card> ))} </div> </ScrollArea> </motion.div> )}
                  {!isLoading && !isTransferring && !generatedScripts && !error && ( <motion.div key="initial" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground/70"> <Sparkles className="w-16 h-16 opacity-40" /> <p className="text-xl font-medium">Ready for Results</p> <p className="text-sm max-w-sm">Your tailored Instagram reel scripts, backed by market insights, will appear here once you provide the details and click 'Generate'.</p> </motion.div> )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Refinement Section - Appears when a script is selected */}
      <AnimatePresence>
        {showRefinementSection && selectedScriptToRefine && (
          <motion.div
            key="refinementSection"
            ref={refinementSectionRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', transition: { duration: 0.5, ease: "easeInOut" } }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
            className="w-full"
          >
            <Separator className="my-8" />
            <Card className="shadow-lg border-border/30 bg-card rounded-2xl overflow-hidden">
              <CardHeader className="p-6 pb-4 bg-gradient-to-br from-card to-muted/30 dark:from-card dark:to-muted/10">
                <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2.5">
                  <Edit3 className="w-5 h-5" />
                  Refine Your Script
                </CardTitle>
                <CardDescription className="text-muted-foreground/90 pt-1.5">
                  Adjust the selected script to better fit your needs.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Original Script:</h3>
                  <ScrollArea className="h-32 p-3 border rounded-md bg-muted/30 dark:bg-muted/10">
                     <p className="text-sm whitespace-pre-wrap text-foreground/80">{selectedScriptToRefine}</p>
                  </ScrollArea>
                </div>

                <Form {...refinementForm}>
                  <form onSubmit={refinementForm.handleSubmit(onRefineSubmit)} className="space-y-5">
                    <FormField
                      control={refinementForm.control}
                      name="refinementType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-foreground/90">How would you like to refine it?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner">
                                <SelectValue placeholder="Select refinement type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-lg shadow-xl">
                              <SelectItem value="CONCISE" className="rounded-md">Make it more concise</SelectItem>
                              <SelectItem value="DETAILED" className="rounded-md">Add more detail / Make it longer</SelectItem>
                              <SelectItem value="CHANGE_TONE" className="rounded-md">Change the tone</SelectItem>
                              <SelectItem value="ENHANCE_CTA" className="rounded-md">Enhance the Call to Action</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchRefinementType === "CHANGE_TONE" && (
                      <FormField
                        control={refinementForm.control}
                        name="newTone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-foreground/90">Select New Tone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner">
                                  <SelectValue placeholder="Select a new tone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-lg shadow-xl">
                                <ScrollArea className="h-[200px]">
                                  {tones.sort().map((t) => (
                                    <SelectItem key={t} value={t} className="rounded-md">{t}</SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {watchRefinementType === "ENHANCE_CTA" && (
                      <FormField
                        control={refinementForm.control}
                        name="ctaFocus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-foreground/90">Call to Action Focus</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Visit my website, follow for more, comment below"
                                {...field}
                                className="bg-input/50 dark:bg-input/20 focus:bg-input border-input focus:border-primary focus:ring-1 focus:ring-primary rounded-lg shadow-inner"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                     <div className="flex justify-end">
                        <Button type="submit" disabled={isRefiningScript} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 shadow-md hover:shadow-lg transition-shadow duration-300">
                        {isRefiningScript ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Refining...</>
                        ) : (
                            <><Edit3 className="mr-2 h-5 w-5" />Refine Script</>
                        )}
                        </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>

              {/* Display Refined Script */}
              <AnimatePresence mode="wait">
                {isRefiningScript && (
                    <motion.div
                    key="refiningLoader"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 pt-0 flex flex-col items-center justify-center text-center space-y-3 text-primary"
                    >
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-md font-medium text-foreground/70">Polishing your script...</p>
                    </motion.div>
                )}
                {refinementError && (
                  <motion.div
                    key="refinementError"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 pt-0"
                  >
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 rounded-lg shadow-inner">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <AlertTitle className="font-semibold">Refinement Error</AlertTitle>
                      <AlertDescription className="text-destructive/90">{refinementError}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                {!isRefiningScript && refinedScriptResult && (
                  <motion.div
                    key="refinedResult"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 pt-0"
                  >
                    <Card className="bg-background shadow-sm border border-primary/30 overflow-hidden rounded-xl">
                      <CardHeader className="p-4 pb-2 bg-primary/10 dark:bg-primary/20 border-b border-primary/30 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold text-primary">
                          Refined Script
                        </CardTitle>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleCopy(refinedScriptResult, "refined")} aria-label="Copy refined script">
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                          {typeof navigator !== 'undefined' && navigator.share && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleShare(refinedScriptResult, "refined")} aria-label="Share refined script">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{refinedScriptResult}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
