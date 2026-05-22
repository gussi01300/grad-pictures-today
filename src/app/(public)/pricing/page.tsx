import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const plans = [
  {
    name: "Yearbook Photo",
    description: "Formal yearbook-style graduation portrait",
    price: 5,
    features: [
      "AI-generated yearbook photo",
      "5 free previews with watermark",
      "Match school gown style",
      "Customize colors",
      "Multiple size presets",
      "High-resolution download",
    ],
    href: "/yearbook",
  },
  {
    name: "Graduation Portrait",
    description: "Cinematic portrait with beautiful backgrounds",
    price: 5,
    features: [
      "AI-generated portrait",
      "5 free previews with watermark",
      "Choose background",
      "Apply style presets",
      "Multiple size presets",
      "High-resolution download",
    ],
    href: "/portraits",
    popular: true,
  },
  {
    name: "Bundle (Coming Soon)",
    description: "Multiple photos at a discounted rate",
    price: null,
    features: [
      "Yearbook photo + Portrait",
      "Even better value",
      "All features included",
      "Priority generation",
    ],
    href: "#",
    disabled: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground">
              Start free with 5 preview generations. Pay only when you love it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.popular ? "border-primary shadow-lg" : ""}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {plan.price ? (
                    <div className="text-4xl font-bold mb-6">
                      ${plan.price} <span className="text-lg font-normal text-muted-foreground">CAD</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold mb-6 text-muted-foreground">
                      Coming Soon
                    </div>
                  )}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={plan.disabled}
                    asChild={!plan.disabled}
                  >
                    {plan.disabled ? (
                      <span>Coming Soon</span>
                    ) : (
                      <Link href={plan.href}>Get Started</Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">What payment methods do you accept?</h3>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards through our secure Stripe payment processing.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Can I get a refund?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, we offer refunds within 30 days of purchase if you&apos;re not satisfied.
                    See our refund policy for details.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">What happens to my photos?</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploaded photos are deleted after 24 hours. Generated photos are kept for 7 days
                    unless you download them.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}