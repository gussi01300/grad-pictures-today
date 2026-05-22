import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose">
            <h1>Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: May 22, 2026</p>

            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, including your name, email address,
              and photos you upload for processing. We also collect usage data to improve our service.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services,
              process your photo generation requests, and communicate with you about your account.
            </p>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties.
              Your uploaded photos are used solely for generating your requested images.
            </p>

            <h2>4. Data Retention</h2>
            <p>
              Uploaded photos are automatically deleted after 24 hours. Generated photos are retained
              for 7 days unless you download them. After download, all data associated with that
              generation is removed from our servers.
            </p>

            <h2>5. Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information
              and uploaded photos. All data is encrypted in transit and at rest.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. Contact us
              at privacy@grad-pictures.today for any requests related to your data.
            </p>

            <h2>7. Cookies</h2>
            <p>
              We use essential cookies for authentication and preferences. We do not use tracking
              or advertising cookies.
            </p>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our service is not directed to children under 13. If you are under 18, you must have
              parental or guardian permission to use our services.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at
              privacy@grad-pictures.today.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}