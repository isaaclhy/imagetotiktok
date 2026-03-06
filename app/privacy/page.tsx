import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Bleamies',
  description: 'Privacy policy for Bleamies',
};

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen p-6 md:p-12 max-w-3xl mx-auto"
      style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: 'var(--font-open-sans), Open Sans, sans-serif',
      }}
    >
      <Link
        href="/"
        className="inline-block text-white/70 hover:text-white text-sm mb-8 transition-colors"
      >
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-white/60 text-sm mb-4">Bleamies</p>
      <p className="text-white/60 text-sm mb-10">Last updated: {new Date().toLocaleDateString('en-US')}</p>

      <p className="text-white/80 mb-8">
        This Privacy Policy describes how Bleamies collects, uses, and shares your information when you use our application and related services.
      </p>

      <div className="space-y-8 text-white/90 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p>
            When you use Bleamies, we may collect information you provide directly, such as when you create an account, contact us, or use our services. This may include your name, email address, and any other information you choose to provide.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve Bleamies, to process transactions, to send you technical notices and support messages, and to respond to your inquiries.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information with service providers who assist us in operating Bleamies, subject to confidentiality obligations. We may also disclose information if required by law or to protect our rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Cookies and Similar Technologies</h2>
          <p>
            We may use cookies and similar tracking technologies to collect information about your browsing activities when you visit our website. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Data Security</h2>
          <p>
            We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, or delete your personal information, or to object to or restrict certain processing. Contact us to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Children&apos;s Privacy</h2>
          <p>
            Bleamies is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or Bleamies, please contact us through the support or contact options provided in our app.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-white/20">
        <Link
          href="/"
          className="inline-block text-white/70 hover:text-white text-sm transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
