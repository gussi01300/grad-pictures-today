"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GenerationForm, type GenerationFormData } from "@/components/forms/generation-form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backgroundPresets, stylePresets } from "@/lib/utils";

type GenerationStatus = "idle" | "uploading" | "generating" | "completed" | "error";

export default function PortraitsPage() {
  const [user, setUser] = React.useState<{ email: string; role: string } | null>(null);
  const [status, setStatus] = React.useState<GenerationStatus>("idle");
  const [progress, setProgress] = React.useState(0);
  const [generationId, setGenerationId] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = React.useState("studio");
  const [selectedStyle, setSelectedStyle] = React.useState("cinematic");

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (data: GenerationFormData) => {
    if (!data.userPhoto) {
      setError("Please upload your photo");
      return;
    }

    setStatus("uploading");
    setProgress(10);
    setError(null);

    try {
      const userFormData = new FormData();
      userFormData.append("file", data.userPhoto);
      const userUploadRes = await fetch("/api/upload", {
        method: "POST",
        body: userFormData,
      });

      if (!userUploadRes.ok) {
        throw new Error("Failed to upload photo");
      }

      const userUpload = await userUploadRes.json();
      setProgress(50);

      const generationRes = await fetch("/api/generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PORTRAIT",
          userPhotoKey: userUpload.key,
          gownColor: data.gownColor,
          capColor: data.capColor,
          sashColor: data.sashColor,
          background: selectedBackground,
          style: selectedStyle,
          capOn: data.capOn,
          diplomaOn: data.diplomaOn,
          consentGiven: true,
        }),
      });

      if (!generationRes.ok) {
        const err = await generationRes.json();
        throw new Error(err.error || "Generation failed");
      }

      const generation = await generationRes.json();
      setGenerationId(generation.generationId);
      setStatus("generating");
      setProgress(60);

      pollGenerationStatus(generation.generationId);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const pollGenerationStatus = async (id: string) => {
    const maxPolls = 60;
    let polls = 0;

    const poll = async () => {
      if (polls >= maxPolls) {
        setStatus("error");
        setError("Generation timed out. Please try again.");
        return;
      }

      try {
        const res = await fetch(`/api/generation/status?id=${id}`);
        const data = await res.json();

        if (data.generation?.status === "COMPLETED") {
          setStatus("completed");
          setProgress(100);
          setPreviewUrl(data.generation.watermarkUrl);
        } else if (data.generation?.status === "FAILED") {
          setStatus("error");
          setError("Generation failed. Please try again.");
        } else {
          polls++;
          setProgress(60 + (polls / maxPolls) * 35);
          setTimeout(poll, 2000);
        }
      } catch {
        polls++;
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  const handlePurchase = async () => {
    if (!generationId) return;

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generationId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Graduation Portrait Generator</h1>
              <p className="text-muted-foreground">
                Create cinematic graduation portraits with beautiful backgrounds
              </p>
            </div>

            <Tabs defaultValue="create" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
                <TabsTrigger value="styles">Styles</TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Your Portrait</CardTitle>
                    <CardDescription>
                      Customize your graduation portrait with preferred settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {status === "idle" && (
                      <GenerationForm type="PORTRAIT" onSubmit={handleSubmit} />
                    )}

                    {(status === "uploading" || status === "generating") && (
                      <div className="space-y-4 py-8">
                        <div className="text-center">
                          <div className="text-lg font-medium mb-2">
                            {status === "uploading" ? "Uploading photos..." : "Generating your portrait..."}
                          </div>
                          <Progress value={progress} className="w-full max-w-md mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">
                            This usually takes 1-2 minutes
                          </p>
                        </div>
                      </div>
                    )}

                    {status === "completed" && previewUrl && (
                      <div className="space-y-6">
                        <div className="relative aspect-[3/4] max-w-md mx-auto bg-muted rounded-lg overflow-hidden">
                          <img
                            src={previewUrl}
                            alt="Generated preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <p className="text-white text-sm text-center">
                              grad-pictures.today
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button onClick={() => setStatus("idle")} variant="outline">
                            Create Another
                          </Button>
                          <Button onClick={handlePurchase}>
                            Download ($5 CAD)
                          </Button>
                        </div>
                      </div>
                    )}

                    {status === "error" && (
                      <div className="space-y-4">
                        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-center">
                          {error || "An error occurred"}
                        </div>
                        <div className="text-center">
                          <Button onClick={() => setStatus("idle")}>
                            Try Again
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="backgrounds">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Background</CardTitle>
                    <CardDescription>
                      Select the perfect backdrop for your portrait
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {backgroundPresets.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => setSelectedBackground(bg.id)}
                          className={`p-4 border rounded-lg text-left transition-all ${
                            selectedBackground === bg.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                            <span className="text-2xl">
                              {bg.id === "studio" && "🏢"}
                              {bg.id === "campus" && "🎓"}
                              {bg.id === "forest" && "🌲"}
                              {bg.id === "outdoor" && "🌤️"}
                              {bg.id === "elegant" && "✨"}
                            </span>
                          </div>
                          <div className="font-medium">{bg.label}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="styles">
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Style</CardTitle>
                    <CardDescription>
                      Apply a visual style to your portrait
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {stylePresets.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStyle(s.id)}
                          className={`p-4 border rounded-lg text-left transition-all ${
                            selectedStyle === s.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <div className="font-medium">{s.label}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}