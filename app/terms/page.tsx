export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8 text-zinc-700 dark:text-zinc-300">
            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4 leading-relaxed">
                By accessing and using Bleameis ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
              </p>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. Your continued use of the Service after any such modifications constitutes your acceptance of the new Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                2. Description of Service
              </h2>
              <p className="mb-4 leading-relaxed">
                Bleameis is a web-based application that allows users to create custom images with text overlays, backgrounds, and styling options. The Service enables users to generate images in various formats and dimensions, with the option to download or share them through third-party platforms.
              </p>
              <p className="leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                3. User Accounts and Registration
              </h2>
              <p className="mb-4 leading-relaxed">
                Some features of the Service may require you to create an account or connect third-party services. When you create an account, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                4. Acceptable Use
              </h2>
              <p className="mb-4 leading-relaxed">
                You agree to use the Service only for lawful purposes and in accordance with these Terms of Service. You agree not to use the Service:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
                <li>To impersonate or attempt to impersonate us, our employees, another user, or any other person or entity</li>
                <li>In any manner that could disable, overburden, damage, or impair the Service</li>
                <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                <li>To create content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable</li>
                <li>To create content that infringes on intellectual property rights of others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                5. Intellectual Property Rights
              </h2>
              <p className="mb-4 leading-relaxed">
                The Service and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <h3 className="text-xl font-medium text-black dark:text-zinc-50 mb-3 mt-4">
                5.1 Your Content
              </h3>
              <p className="mb-4 leading-relaxed">
                You retain ownership of any content you create using the Service. By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and process your content solely for the purpose of providing and improving the Service.
              </p>
              <h3 className="text-xl font-medium text-black dark:text-zinc-50 mb-3 mt-4">
                5.2 Third-Party Content
              </h3>
              <p className="leading-relaxed">
                You are solely responsible for ensuring that any content you create does not infringe on the intellectual property rights of third parties. We are not responsible for any claims arising from your use of copyrighted material.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                6. Third-Party Services and Integrations
              </h2>
              <p className="mb-4 leading-relaxed">
                The Service may integrate with third-party services, including but not limited to TikTok, for the purpose of sharing or posting content. When you use these integrations:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>You are subject to the terms and conditions of those third-party services</li>
                <li>We are not responsible for the practices, content, or policies of third-party services</li>
                <li>You authorize us to access and transmit your content to these third-party services on your behalf</li>
                <li>Any data you share with third-party services is governed by their respective privacy policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                7. Payment Terms
              </h2>
              <p className="mb-4 leading-relaxed">
                Some features of the Service may require payment. If you purchase a subscription or paid feature:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>You agree to pay all fees associated with your purchase</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>We reserve the right to change our pricing with notice to you</li>
                <li>Subscriptions will automatically renew unless cancelled</li>
                <li>You are responsible for any taxes applicable to your purchase</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                8. Disclaimer of Warranties
              </h2>
              <p className="mb-4 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                <li>That the Service will be uninterrupted, timely, secure, or error-free</li>
                <li>That defects will be corrected or that the Service is free of viruses or other harmful components</li>
                <li>Any warranties arising from course of dealing or usage of trade</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                9. Limitation of Liability
              </h2>
              <p className="mb-4 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL WE BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, use, goodwill, or other intangible losses</li>
                <li>Damages resulting from your use or inability to use the Service</li>
                <li>Damages resulting from unauthorized access to or alteration of your content</li>
              </ul>
              <p className="leading-relaxed">
                Our total liability to you for all claims arising from or related to the use of the Service shall not exceed the amount you paid us in the twelve (12) months prior to the action giving rise to liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                10. Indemnification
              </h2>
              <p className="mb-4 leading-relaxed">
                You agree to defend, indemnify, and hold harmless us and our officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable legal and accounting fees, arising out of or in any way connected with:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Your access to or use of the Service</li>
                <li>Your violation of these Terms of Service</li>
                <li>Your violation of any third-party rights, including intellectual property rights</li>
                <li>Any content you create or transmit through the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                11. Termination
              </h2>
              <p className="mb-4 leading-relaxed">
                We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
                <li>Breach of these Terms of Service</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Requests by law enforcement or other government agencies</li>
              </ul>
              <p className="leading-relaxed">
                Upon termination, your right to use the Service will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                12. Governing Law and Dispute Resolution
              </h2>
              <p className="mb-4 leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
              <p className="leading-relaxed">
                Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization], except where prohibited by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-4">
                13. Miscellaneous
              </h2>
              <h3 className="text-xl font-medium text-black dark:text-zinc-50 mb-3 mt-4">
                13.1 Entire Agreement
              </h3>
              <p className="mb-4 leading-relaxed">
                These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and us regarding the use of the Service.
              </p>
              <h3 className="text-xl font-medium text-black dark:text-zinc-50 mb-3 mt-4">
                13.2 Severability
              </h3>
              <p className="mb-4 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
              <h3 className="text-xl font-medium text-black dark:text-zinc-50 mb-3 mt-4">
                13.3 Waiver
              </h3>
              <p className="leading-relaxed">
                No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
