"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface Generation {
  id: string;
  type: string;
  status: string;
  watermarkUrl: string | null;
  outputUrl: string | null;
  createdAt: string;
}

export default function DownloadPage() {
  const [user, setUser] = React.useState<{ email: string; role: string } | null>(null);
  const [generations, setGenerations] = React.useState<Generation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          loadGenerations(data.user);
        } else {
          window.location.href = "/login?redirect=/download";
        }
      })
      .catch(console.error);
  }, []);

  const loadGenerations = async (currentUser: { email: string; role: string }) => {
    try {
      const res = await fetch("/api/generation/status");
      const data = await res.json();
      setGenerations(data.generations ?? []);
    } catch (error) {
      console.error("Failed to load generations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (generationId: string) => {
    // Check if purchased
    const res = await fetch(`/api/download/check?generationId=${generationId}`);
    const data = await res.json();

    if (data.purchased && data.url) {
      window.open(data.url, "_blank");
    } else {
      // Redirect to purchase
      window.location.href = `/checkout?generation=${generationId}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">My Downloads</h1>
              <p className="text-muted-foreground">
                View and download your generated photos
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : generations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-4">📷</div>
                  <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate your first graduation photo to see it here.
                  </p>
                  <Button asChild>
                    <a href="/yearbook">Get Started</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generations.map((gen) => (
                  <Card key={gen.id}>
                    <CardContent className="pt-6">
                      {gen.watermarkUrl ? (
                        <div className="relative aspect-[3/4] bg-muted rounded-lg mb-4 overflow-hidden">
                          <img
                            src={gen.watermarkUrl}
                            alt="Generated photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] bg-muted rounded-lg mb-4 flex items-center justify-center">
                          <span className="text-muted-foreground">Processing...</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{gen.type.toLowerCase()} Photo</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(gen.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button onClick={() => handleDownload(gen.id)} size="sm">
                          {gen.status === "COMPLETED" ? "Download" : "Purchase"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}