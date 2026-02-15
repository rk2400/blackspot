import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-6">Privacy Policy</h1>
        <p className="text-stone-600 mb-8">
          We value your privacy. This policy explains what data we collect, how we use it, and your rights.
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Information We Collect</h2>
            <p className="text-stone-700">
              We collect your name, email, and phone when you create an account or contact us. We do not collect shipping or order information.
              We also collect basic technical information such as browser type and device identifiers to improve site performance.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">How We Use Information</h2>
            <p className="text-stone-700">
              We use your information to provide access to wellness tools, communicate updates, offer support, and improve our services.
              We may send you promotional emails; you can opt out at any time using the unsubscribe link.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Payments</h2>
            <p className="text-stone-700">
              Payments are processed by third-party providers. We do not store full payment details on our servers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Cookies</h2>
            <p className="text-stone-700">
              Cookies help keep you signed in and remember preferences. You can manage cookies in your browser settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Data Sharing</h2>
            <p className="text-stone-700">
              We do not sell your personal data. We may share data with trusted partners only to deliver the service (e.g., email infrastructure).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Your Rights</h2>
            <p className="text-stone-700">
              You can request, update, or delete your information by contacting us. We will honor reasonable requests subject to legal and operational requirements.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Contact</h2>
            <p className="text-stone-700">
              For privacy questions, contact us via the <Link className="text-primary-600 hover:text-primary-500" href="/contact">contact page</Link>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
