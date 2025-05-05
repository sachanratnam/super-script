
"use client";

import { useState, useEffect } from "react"; // Import useEffect
import type { GenerateReelScriptsInput, GenerateReelScriptsOutput } from "@/ai/flows/generate-reel-scripts";
import { generateReelScripts } from "@/ai/flows/generate-reel-scripts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  topic: z.string().min(5, { message: "Topic must be at least 5 characters." }),
  length: z.enum(["15s", "30s", "60s", "90s"]),
  language: z.string().min(1, { message: "Please select a language." }),
  tone: z.string().min(1, { message: "Please select a tone." }),
  objective: z.string().min(1, { message: "Please select an objective." }),
});

const languages = [
  "English",
  "Hindi",
  "Marathi",
  "Bengali",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Odia",
  "Malayalam",
];

const tones = ["Humorous", "Motivational", "Educational", "Inspirational", "Informative", "Dramatic", "Casual", "Formal"];
const objectives = ["Increase brand awareness", "Drive sales", "Educate audience", "Build community", "Generate leads", "Increase engagement"];

export function ReelGeneratorForm() {
  const [generatedScripts, setGeneratedScripts] = useState<GenerateReelScriptsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // State to track client-side mount

  useEffect(() => {
    setIsClient(true); // Set to true only on the client after mounting
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      length: "30s",
      language: "English",
      tone: "Motivational",
      objective: "Increase engagement",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setGeneratedScripts(null); // Clear previous results immediately

    try {
      const input: GenerateReelScriptsInput = values;
      const result = await generateReelScripts(input);
      setGeneratedScripts(result);
    } catch (err) {
      console.error("Error generating scripts:", err);
      // Updated error message
      setError("Hmm, couldn't generate scripts with that input. Could you try rephrasing your topic or adjusting the settings?");
    } finally {
       setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 w-full">
      {/* Left Column: Form */}
      <Card className="w-full shadow-lg mb-8 md:mb-0">
        <CardHeader>
          <CardTitle className="text-2xl text-accent">Create Your Next Viral Reel</CardTitle>
          <CardDescription>
            Fill in the details below and let our AI generate compelling scripts for you.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {isClient ? ( // Only render FormField for topic on the client
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Reel Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 'Easy 5-minute breakfast ideas'"
                          {...field}
                          className="text-base md:text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                // Render a placeholder during SSR and initial client render
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" /> {/* Placeholder for label */}
                  <Skeleton className="h-10 w-full" /> {/* Placeholder for input */}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Length</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-base md:text-sm">
                            <SelectValue placeholder="Select reel length" />
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
                      <FormLabel className="font-semibold">Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-base md:text-sm">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-base md:text-sm">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tones.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
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
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Objective</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-base md:text-sm">
                            <SelectValue placeholder="Select objective" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {objectives.map((obj) => (
                            <SelectItem key={obj} value={obj}>
                              {obj}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading || !isClient} className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building your viral scripts...
                  </>
                ) : (
                  "Generate Scripts"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Right Column: Results */}
      <div className="w-full">
        <Card className="shadow-lg h-full">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Generated Scripts</CardTitle>
            <CardDescription>
              Here are the AI-generated scripts based on your input.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-120px)]"> {/* Adjust height as needed */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Oops!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="space-y-4 p-4 h-full flex flex-col justify-center items-center">
                {/* Loading Animation and Text */}
                <div className="w-full text-center mb-4">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                        Crafting your scripts for maximum results...
                    </p>
                </div>

                {/* Placeholder Skeleton */}
                 <div className="space-y-2 p-4 border rounded-md bg-secondary/30 w-full opacity-50">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                 {/* Add more skeletons if desired */}
              </div>
            )}

            {!isLoading && generatedScripts && (
               <ScrollArea className="h-full w-full rounded-md border p-4 bg-secondary/50">
                <div className="space-y-4">
                  {generatedScripts.scripts.map((script, index) => (
                    <Card key={index} className="bg-card">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">Script {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <pre className="whitespace-pre-wrap text-sm text-card-foreground font-sans">{script}</pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}

             {!isLoading && !generatedScripts && !error && (
                <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
                    Your generated scripts will appear here.
                </div>
            )}
          </CardContent>
          {/* Footer can be added if needed */}
          {/* <CardFooter></CardFooter> */}
        </Card>
      </div>
    </div>
  );
}
