"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Download, Wand2, FileText, FileCheck, AlertTriangle, Sparkles, Upload } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizeResume, improveSummaryAction, improveExperienceAction } from "@/app/actions";
import type { ATSKeywordOptimizationOutput } from "@/ai/flows/ats-keyword-optimization";
import type { ResumeSummaryImprovementOutput } from "@/ai/flows/resume-summary-improvement";
import type { ExperienceImprovementOutput } from "@/ai/flows/experience-improvement";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as pdfjsLib from 'pdfjs-dist';

type ResumeStyle = "theme-classic" | "theme-modern" | "theme-compact";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [editedResume, setEditedResume] = useState("");
  const [optimizationResult, setOptimizationResult] = useState<ATSKeywordOptimizationOutput | null>(null);
  const [summaryResult, setSummaryResult] = useState<ResumeSummaryImprovementOutput | null>(null);
  const [experienceResult, setExperienceResult] = useState<ExperienceImprovementOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);
  const [isImprovingExperience, setIsImprovingExperience] = useState(false);
  const { toast } = useToast();
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>("theme-modern");

  useEffect(() => {
    // Set workerSrc for pdfjs
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  useEffect(() => {
    if (optimizationResult?.optimizedResume) {
      setEditedResume(optimizationResult.optimizedResume);
    }
  }, [optimizationResult]);
  
  const handleOptimize = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both your resume and a job description.",
      });
      return;
    }
    setIsLoading(true);
    setOptimizationResult(null);
    setSummaryResult(null);
    setExperienceResult(null);
    try {
      const result = await optimizeResume({ resumeText, jobDescription });
      setOptimizationResult(result);
      setEditedResume(result.optimizedResume);
      setActiveTab("editor");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveSummary = async () => {
    const textToImprove = editedResume || resumeText;
    if (!textToImprove.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Resume",
        description: "Please provide your resume text or run the optimization first.",
      });
      return;
    }
    setIsImprovingSummary(true);
    try {
      const result = await improveSummaryAction({ resumeText: textToImprove });
      setSummaryResult(result);
      setActiveTab("summary");
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Summary Improvement Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsImprovingSummary(false);
    }
  };

  const handleImproveExperience = async () => {
    const textToImprove = editedResume || resumeText;
    if (!textToImprove.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Resume",
        description: "Please provide your resume text or run the optimization first.",
      });
      return;
    }
    setIsImprovingExperience(true);
    try {
      const result = await improveExperienceAction({ resumeText: textToImprove });
      setExperienceResult(result);
      setActiveTab("experience");
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Experience Improvement Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsImprovingExperience(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n';
        }
        setResumeText(textContent);
        toast({
          title: "Success",
          description: "Your resume has been imported.",
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "PDF Parsing Failed",
        description: "Could not read the content of the PDF. Please try again or paste the text manually.",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadTxt = () => {
    const text = editedResume || resumeText;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = async () => {
    const element = resumePreviewRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("resume.pdf");
  };

  const parseResumeForPreview = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    let isFirstH1 = true;

    const commonHeaders = ["summary", "experience", "education", "skills", "projects", "profile", "professional experience", "technical skills", "certifications", "work experience"];

    return lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <br key={index} />;

        const lowerLine = trimmedLine.toLowerCase().replace(/:/g, '');
        if (commonHeaders.includes(lowerLine)) {
            return <h2 key={index}>{trimmedLine}</h2>;
        }

        // Assume first non-empty line is the name
        if (isFirstH1 && index < 3 && trimmedLine.split(' ').length < 4) {
            isFirstH1 = false;
            return <h1 key={index}>{trimmedLine}</h1>;
        }
        // Assume lines with @ or phone numbers are contact info
        if (trimmedLine.includes('@') || trimmedLine.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)) {
            return <p key={index} className="contact-info">{trimmedLine}</p>;
        }

        return <p key={index}>{trimmedLine}</p>;
    });
};

  const formatCheckResults = [
    {
      title: "Use Standard Fonts",
      description: "Stick to common fonts like Arial, Calibri, or Times New Roman. Our previews use ATS-friendly fonts.",
      Icon: FileCheck,
      variant: "default" as const
    },
    {
      title: "Avoid Columns and Tables",
      description: "Complex layouts can confuse ATS. A single-column format is safest. This editor encourages a single-column layout.",
      Icon: FileCheck,
      variant: "default" as const
    },
    {
      title: "Use Standard Section Headers",
      description: "Use conventional headers like 'Experience', 'Education', and 'Skills'. Our preview parser looks for these.",
      Icon: FileCheck,
      variant: "default" as const
    },
    {
      title: "Be Mindful of Special Characters",
      description: "Excessive use of special characters or symbols can sometimes cause parsing errors.",
      Icon: AlertTriangle,
      variant: "destructive" as const
    },
  ];
  
  const currentResumeText = editedResume || resumeText;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Column 1: Input */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary"/>
                Step 1: Input
              </CardTitle>
              <CardDescription>Paste your resume, or upload a PDF.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="resume-input">Your Resume</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf"
                    className="hidden"
                    disabled={isUploading || isLoading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isLoading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload PDF
                  </Button>
                </div>
                <Textarea
                  id="resume-input"
                  placeholder="Paste your full resume text here, or upload a PDF."
                  className="min-h-[200px] font-mono text-sm"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  disabled={isLoading || isUploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-description-input">Job Description</Label>
                <Textarea
                  id="job-description-input"
                  placeholder="Paste the job description here..."
                  className="min-h-[200px] font-mono text-sm"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleOptimize} disabled={isLoading || isUploading || !resumeText || !jobDescription} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Optimize with AI
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Column 2: Analysis & Editor */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="text-primary" />
                Step 2: Refine
              </CardTitle>
              <CardDescription>Edit your resume and review AI suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[468px]">
              {isLoading && !optimizationResult ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : optimizationResult || editedResume ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="format">Format Check</TabsTrigger>
                  </TabsList>
                  <TabsContent value="editor" className="mt-4">
                    <Label htmlFor="resume-editor" className="sr-only">Resume Editor</Label>
                    <Textarea
                      id="resume-editor"
                      aria-label="Optimized Resume Editor"
                      className="min-h-[380px] font-mono text-sm"
                      value={editedResume}
                      onChange={(e) => setEditedResume(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="keywords" className="min-h-[380px] space-y-4 mt-4">
                    {optimizationResult ? (
                      <>
                        <div>
                          <h3 className="font-semibold mb-2">Missing Keywords</h3>
                          <div className="flex flex-wrap gap-2">
                            {optimizationResult.missingKeywords.length > 0 ? (
                              optimizationResult.missingKeywords.map((kw, i) => (
                                <Badge key={`missing-${i}`} variant="destructive">{kw}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No missing keywords found. Great job!</p>
                            )}
                          </div>
                        </div>
                         <div>
                          <h3 className="font-semibold mb-2">Suggested Keywords</h3>
                          <div className="flex flex-wrap gap-2">
                             {optimizationResult.suggestedKeywords.length > 0 ? (
                              optimizationResult.suggestedKeywords.map((kw, i) => (
                                <Badge key={`suggested-${i}`} variant="secondary">{kw}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No specific keywords to suggest.</p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center pt-10">Run optimization to see keyword analysis.</p>
                    )}
                  </TabsContent>
                   <TabsContent value="summary" className="min-h-[380px] space-y-4 mt-4">
                      <Button onClick={handleImproveSummary} disabled={isImprovingSummary || !currentResumeText} size="sm" className="w-full">
                        {isImprovingSummary ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                        ) : (
                          <><Sparkles className="mr-2 h-4 w-4" />Improve Summary with AI</>
                        )}
                      </Button>
                      {isImprovingSummary && !summaryResult && <Skeleton className="h-32 w-full" />}
                      {summaryResult && (
                        <div className="p-4 border rounded-lg bg-secondary/50">
                          <h3 className="font-semibold mb-2">AI-Suggested Summary</h3>
                          <p className="text-sm text-secondary-foreground">{summaryResult.improvedSummary}</p>
                        </div>
                      )}
                  </TabsContent>
                  <TabsContent value="experience" className="min-h-[380px] space-y-4 mt-4">
                      <Button onClick={handleImproveExperience} disabled={isImprovingExperience || !currentResumeText} size="sm" className="w-full">
                        {isImprovingExperience ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                        ) : (
                          <><Sparkles className="mr-2 h-4 w-4" />Improve Experience with AI</>
                        )}
                      </Button>
                      {isImprovingExperience && !experienceResult && <Skeleton className="h-32 w-full" />}
                      {experienceResult && (
                        <div className="p-4 border rounded-lg bg-secondary/50">
                          <h3 className="font-semibold mb-2">AI-Suggested Experience Section</h3>
                          <p className="text-sm text-secondary-foreground whitespace-pre-line">{experienceResult.improvedExperience}</p>
                        </div>
                      )}
                  </TabsContent>
                  <TabsContent value="format" className="min-h-[380px] space-y-3 mt-4">
                     {formatCheckResults.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                           <item.Icon className={`mt-1 h-5 w-5 shrink-0 ${item.variant === 'destructive' ? 'text-destructive' : 'text-primary'}`} />
                           <div className="flex-1">
                               <p className="font-semibold">{item.title}</p>
                               <p className="text-sm text-muted-foreground">{item.description}</p>
                           </div>
                        </div>
                     ))}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-[380px] border-2 border-dashed rounded-lg p-4">
                  <Wand2 className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium text-muted-foreground">Your AI analysis will appear here</p>
                  <p className="text-sm text-muted-foreground">Click "Optimize with AI" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Column 3: Preview & Download */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="text-primary" />
                Step 3: Download
              </CardTitle>
              <CardDescription>Preview your resume and download it.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div>
                  <Label>Preview Style</Label>
                  <RadioGroup defaultValue={resumeStyle} onValueChange={(v: string) => setResumeStyle(v as ResumeStyle)} className="flex gap-4 mt-2">
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="theme-classic" id="r1" />
                        <Label htmlFor="r1">Classic</Label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="theme-modern" id="r2" />
                        <Label htmlFor="r2">Modern</Label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="theme-compact" id="r3" />
                        <Label htmlFor="r3">Compact</Label>
                     </div>
                  </RadioGroup>
                </div>
                <div ref={resumePreviewRef} className={`resume-preview ${resumeStyle}`}>
                    {(isLoading || isUploading) && !currentResumeText ? (
                        <div className="space-y-4 animate-pulse">
                            <Skeleton className="h-8 w-1/2 mx-auto" />
                            <Skeleton className="h-4 w-3/4 mx-auto" />
                            <Skeleton className="h-6 w-1/4 mt-4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-6 w-1/4 mt-4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ) : (currentResumeText ? parseResumeForPreview(currentResumeText) : <p className="text-center text-muted-foreground py-16">Preview will appear here</p>)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleDownloadPdf} disabled={!currentResumeText || isLoading || isUploading} variant="default" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={handleDownloadTxt} disabled={!currentResumeText || isLoading || isUploading} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download TXT
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
