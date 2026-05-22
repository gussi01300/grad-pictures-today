"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function CheckoutSuccessPage() {
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    if (id) {
      fetch(`/api/checkout/verify?session_id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            window.location.href = `/download?generation=${data.generationId}`;
          }
        })
        .catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-6">🎓</div>
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase. Your high-resolution photo is ready for download.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to your download...
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}