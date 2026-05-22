"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-6">👋</div>
            <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
            <p className="text-muted-foreground mb-8">
              Your payment was cancelled. You can still use your free previews or try again when you&apos;re ready.
            </p>
            <div className="space-y-4">
              <Link href="/yearbook" className="block">
                <button type="button" className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90">
                  Back to Yearbook Photo
                </button>
              </Link>
              <Link href="/portraits" className="block">
                <button type="button" className="w-full border border-input px-6 py-2 rounded-md font-medium hover:bg-accent">
                  Back to Graduation Portraits
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}