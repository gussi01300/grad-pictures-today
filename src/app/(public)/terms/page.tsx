import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose">
            <h1>Terms of Use</h1>
            <p className="text-muted-foreground">Last updated: May 22, 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Grad-Pictures.today, you agree to be bound by these Terms of Use.
              If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Grad-Pictures.today provides AI-powered photo generation services for graduation and
              yearbook photos. Our service allows users to generate professional-looking photos using
              artificial intelligence.
            </p>

            <h2>3. User Eligibility</h2>
            <p>
              You must be at least 13 years old to use our service. If you are under 18, you confirm
              that you have obtained parental or guardian consent to use our services.
            </p>

            <h2>4. User Responsibilities</h2>
            <p>
              You agree to:
            </p>
            <ul>
              <li>Provide accurate information when using our service</li>
              <li>Only upload photos you own or have permission to use</li>
              <li>Not use our service for any illegal or unauthorized purpose</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <p>
              You retain ownership of photos you upload. You grant us a limited license to process your
              photos solely for the purpose of providing our services. Generated photos are for your
              personal use only and may not be used for commercial purposes without our written consent.
            </p>

            <h2>6. Payment and Refunds</h2>
            <p>
              Payments are processed through Stripe. All sales are final unless otherwise stated in our
              Refund Policy. We offer a 30-day money-back guarantee for all purchases.
            </p>

            <h2>7. Service Availability</h2>
            <p>
              We strive to provide uninterrupted service, but we do not guarantee continuous availability.
              We reserve the right to modify, suspend, or discontinue our service at any time.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Grad-Pictures.today shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your use
              of our services.
            </p>

            <h2>9. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any
              material changes by posting the updated terms on our website.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Canada,
              without regard to its conflict of law provisions.
            </p>

            <h2>11. Contact</h2>
            <p>
              Questions about these Terms? Contact us at legal@grad-pictures.today.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}