import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-6">Terms of Service</h1>
        <p className="text-stone-600 mb-8">
          By using The BlackSpot Project website and tools, you agree to the following terms. Please read them carefully.
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Use of Service</h2>
            <p className="text-stone-700">
              We provide wellness tools such as affirmations, journaling, breath cycles, and short “manifest” videos. Features may change,
              be added, or be removed over time. We may limit access to maintain security, stability, or for misuse prevention.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Eligibility & Accounts</h2>
            <p className="text-stone-700">
              You must be capable of forming a binding agreement and comply with your local age-of-consent rules to use the service. Keep
              your account credentials secure. You are responsible for activity under your account and for promptly notifying us of suspected misuse.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">User Content</h2>
            <p className="text-stone-700">
              You may create or upload content (e.g., journal entries, manifest videos). You retain ownership of your content. You grant us a
              limited license to store, process, and display it solely to provide the service to you. Do not upload unlawful, harmful, or infringing content.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Health & Safety Disclaimer</h2>
            <p className="text-stone-700">
              Our tools support general wellness, reflection, and mindfulness. They are not medical advice or a substitute for professional care.
              If you have medical or mental health concerns, consult a qualified professional.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Limitation of Liability</h2>
            <p className="text-stone-700">
              To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of the
              service. Your use is at your own discretion and risk.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Intellectual Property</h2>
            <p className="text-stone-700">
              All content, logos, and designs on this website are owned by The BlackSpot Project. Do not copy or distribute without permission.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Acceptable Use</h2>
            <p className="text-stone-700">
              Do not attempt to disrupt, reverse engineer, or misuse the service; do not upload malicious code; do not harass or harm others.
              We may suspend accounts that violate these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Privacy</h2>
            <p className="text-stone-700">
              Your use of the service is also governed by our <Link className="text-primary-600 hover:text-primary-500" href="/privacy">Privacy Policy</Link>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Changes & Availability</h2>
            <p className="text-stone-700">
              We may update these terms and the service. We aim for stable availability but do not guarantee uninterrupted access.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Termination</h2>
            <p className="text-stone-700">
              You may stop using the service at any time. We may suspend or terminate access for breach, misuse, or legal requirements.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Contact</h2>
            <p className="text-stone-700">
              For questions about these terms, contact us via the <Link className="text-primary-600 hover:text-primary-500" href="/contact">contact page</Link>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
