import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    title: "AI-Powered Generation",
    description: "State-of-the-art AI creates realistic graduation photos that match your style preferences.",
  },
  {
    title: "Multiple Backgrounds",
    description: "Choose from studio, campus, forest, outdoor, or elegant backgrounds for your portraits.",
  },
  {
    title: "Customizable Colors",
    description: "Match your school colors exactly with our color picker and preset options.",
  },
  {
    title: "Fast Delivery",
    description: "Get your generated photos within minutes, not weeks.",
  },
  {
    title: "High-Resolution",
    description: "Download in multiple sizes suitable for print, social media, and yearbooks.",
  },
  {
    title: "Secure & Private",
    description: "Your photos are automatically deleted after download. Your privacy is our priority.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    university: "University of Toronto",
    text: "I missed my school photoshoot and was worried I'd have nothing for my yearbook. This saved me! The quality is amazing.",
  },
  {
    name: "James K.",
    university: "McGill University",
    text: "Such a great alternative to expensive professional photography. The AI captured exactly what I was looking for.",
  },
  {
    name: "Emily R.",
    university: "UBC",
    text: "The graduation portraits look so professional. My whole friend group is using it now!",
  },
];

const faqs = [
  {
    q: "How does it work?",
    a: "Upload a photo of yourself, customize your graduation attire colors and style, and our AI will generate professional graduation photos in minutes.",
  },
  {
    q: "Is my photo safe?",
    a: "Yes. Uploaded photos are automatically deleted after 24 hours. Generated photos are kept for 7 days unless you download them.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "You get 5 free previews with watermark. If you're happy with the result, you can purchase a high-resolution download for just $5 CAD.",
  },
  {
    q: "Can I use a reference photo?",
    a: "For yearbook photos, you can upload a reference photo from your school's existing graduation photos. We only use it to match the gown style - we never copy anyone.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Professional Graduation Photos,{" "}
                <span className="text-primary">Powered by AI</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Skip the expensive photoshoot. Generate stunning yearbook and graduation portraits
                in minutes for a fraction of the cost.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/yearbook">Create Yearbook Photo</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/portraits">Graduation Portraits</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Preview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Sample Generated Photos</h2>
            <p className="text-center text-muted-foreground mb-12">
              See what our AI can create
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center"
                >
                  <span className="text-4xl">🎓</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
            <p className="text-center text-muted-foreground mb-12">
              Start with free previews, pay only when you love it
            </p>
            <div className="max-w-md mx-auto">
              <Card className="border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Single Photo</CardTitle>
                  <CardDescription>High-resolution download</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-5xl font-bold mb-2">$5 CAD</div>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Watermark-free download
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Multiple size presets
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Instant delivery
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      5 free previews
                    </li>
                  </ul>
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/yearbook">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Students Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <Card key={t.name}>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4">&ldquo;{t.text}&rdquo;</p>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.university}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-2xl mx-auto space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.q}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Graduation Photo?</h2>
            <p className="text-muted-foreground mb-8">
              Start with 5 free previews. No credit card required.
            </p>
            <Button size="lg" asChild>
              <Link href="/yearbook">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}