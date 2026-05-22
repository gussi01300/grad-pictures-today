import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose">
            <h1>Refund Policy</h1>
            <p className="text-muted-foreground">Last updated: May 22, 2026</p>

            <h2>1. Refund Eligibility</h2>
            <p>
              We offer a 30-day money-back guarantee on all purchased photo downloads. If you are not
              satisfied with your generated photo, you may request a full refund within 30 days of
              your purchase.
            </p>

            <h2>2. How to Request a Refund</h2>
            <p>
              To request a refund:
            </p>
            <ul>
              <li>Email us at refunds@grad-pictures.today with your order details</li>
              <li>Include your email address and the generation ID</li>
              <li>Describe the reason for your refund request</li>
            </ul>
            <p>
              We aim to process all refund requests within 3-5 business days.
            </p>

            <h2>3. Refund Process</h2>
            <p>
              Once your refund is approved, the amount will be credited back to your original payment
              method. Please note that your bank or credit card company may take additional time to
              process the refund.
            </p>

            <h2>4. Partial Refunds</h2>
            <p>
              In exceptional circumstances, partial refunds may be offered at our discretion. Contact
              support for consideration of partial refund requests.
            </p>

            <h2>5. Non-Refundable Items</h2>
            <p>
              Free previews with watermark are provided at no cost and are therefore not eligible for
              refunds. Only purchased high-resolution downloads are covered by our refund policy.
            </p>

            <h2>6. Late or Missing Refunds</h2>
            <p>
              If you haven&apos;t received your refund within 10 business days after approval, please
              check with your bank or credit card company. If the issue persists, contact us at
              refunds@grad-pictures.today.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              For any questions about our refund policy, please contact us at
              refunds@grad-pictures.today.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}