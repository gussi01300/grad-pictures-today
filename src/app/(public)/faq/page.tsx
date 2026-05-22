import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const faqs = [
  {
    q: "How does the AI photo generation work?",
    a: "Upload a clear photo of yourself, customize your graduation attire colors, and our AI will generate a professional graduation portrait. For yearbook photos, you can optionally upload a reference image to match your school's gown style.",
  },
  {
    q: "Is my photo safe and private?",
    a: "Yes. Uploaded photos are automatically deleted after 24 hours. Generated photos are kept for 7 days unless you download them. We never share your photos with third parties.",
  },
  {
    q: "What do I get with the free preview?",
    a: "You get 5 generation attempts per session with a watermark. This allows you to try different settings and see the results before purchasing.",
  },
  {
    q: "What does the $5 CAD purchase include?",
    a: "For $5 CAD, you get a high-resolution, watermark-free download of your generated photo in multiple size presets (Instagram, 4x6, 5x7, 8x10, yearbook, and high-resolution).",
  },
  {
    q: "Can I use a reference photo from my school?",
    a: "Yes! For yearbook photos, you can upload a reference graduation photo from your school. We only use it to match the gown and cap style - we never copy or replicate the person in the reference image.",
  },
  {
    q: "How long does generation take?",
    a: "Most generations complete within 1-2 minutes. During busy times, it may take slightly longer.",
  },
  {
    q: "What if I'm not satisfied with the result?",
    a: "You can generate up to 5 free previews with different settings. If you're not happy with any of them, you don't need to purchase. We're always improving our AI to produce better results.",
  },
  {
    q: "Can I use this if I'm under 18?",
    a: "Yes, but if you're under 18, you need parent or guardian permission to use the service. By using the app, you confirm that you have the necessary permissions.",
  },
  {
    q: "What file formats are supported?",
    a: "We accept JPEG, PNG, and WebP images up to 10MB in size. For best results, use a clear, well-lit photo with your face clearly visible.",
  },
  {
    q: "How do I get a refund?",
    a: "We offer refunds within 30 days of purchase. Contact us through our form with your order details and we'll process your refund. See our Refund Policy for full details.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about Grad-Pictures.today
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Still have questions?
              </p>
              <Link href="/contact" className="text-primary hover:underline">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}