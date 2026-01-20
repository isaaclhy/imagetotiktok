export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8 text-zinc-700 dark:text-zinc-300">
            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                1. Introduction
              </h2>
              <p className="mb-4 leading-relaxed">
                Welcome to Bleameis ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
              <p className="leading-relaxed">
                Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access or use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-medium text-black dark:text-zinc-50 mb-3 mt-4">
                2.1 Information You Provide
              </h3>
              <p className="mb-4 leading-relaxed">
                We collect information that you voluntarily provide to us when you use our service, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Text content and images you create using our service</li>
                <li>Account information if you choose to create an account</li>
                <li>Preferences and settings you configure</li>
                <li>Communications with us, including support requests</li>
              </ul>

              <h3 className="text-xl font-medium text-black dark:text-zinc-50 mb-3 mt-4">
                2.2 Automatically Collected Information
              </h3>
              <p className="mb-4 leading-relaxed">
                When you access our service, we may automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="mb-4 leading-relaxed">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>To provide, maintain, and improve our service</li>
                <li>To process your requests and transactions</li>
                <li>To send you administrative information and updates</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To detect, prevent, and address technical issues and security threats</li>
                <li>To analyze usage patterns and trends to improve user experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="mb-4 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as hosting, analytics, and customer support.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred.</li>
                <li><strong>With Your Consent:</strong> We may share information with your explicit consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                5. Third-Party Services
              </h2>
              <p className="mb-4 leading-relaxed">
                Our service may integrate with third-party services, including TikTok, for posting content. When you connect these services, they may collect and process your information according to their own privacy policies. We encourage you to review the privacy policies of any third-party services you use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                6. Data Security
              </h2>
              <p className="mb-4 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                7. Your Rights and Choices
              </h2>
              <p className="mb-4 leading-relaxed">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to delete your information</li>
                <li>The right to restrict or object to processing</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
              <p className="leading-relaxed">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                8. Data Retention
              </h2>
              <p className="mb-4 leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                9. Children's Privacy
              </h2>
              <p className="mb-4 leading-relaxed">
                Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="mb-4 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
