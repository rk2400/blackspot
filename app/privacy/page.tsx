import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-6">Privacy Policy</h1>
        <p className="text-stone-600 mb-8">
          We value your privacy. This policy explains what we collect, how we use it, and your choices in the context of our wellness tools
          (affirmations, journaling, breath cycles, and short “manifest” videos).
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Information We Collect</h2>
            <p className="text-stone-700">
              - Account details: name, email, phone, and optional address you provide.<br/>
              - Preferences: interests you select on your profile to personalize suggestions.<br/>
              - Practice content: journal entries you save and manifest videos you upload (including filenames and basic metadata).<br/>
              - Technical data: device/browser information, IP, and basic logs to keep the service secure and reliable.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">How We Use Information</h2>
            <p className="text-stone-700">
              We use information to provide access to tools, personalize experiences (e.g., interests-based suggestions), maintain security,
              send login OTPs and essential communications, and improve the product. If you opt in to updates or reminders, we may email you
              brief messages from <Link className="text-primary-600 hover:text-primary-500" href="/contact">our team</Link>. You can opt out any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Cookies</h2>
            <p className="text-stone-700">
              Cookies help keep you signed in and remember preferences. We set a session token cookie to authenticate your account securely.
              We may also use local storage for simple UI state. You can manage cookies and storage in your browser settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Data Sharing</h2>
            <p className="text-stone-700">
              We do not sell personal data. We may share limited information with trusted providers solely to deliver the service (e.g., email
              infrastructure and hosting). Partners are required to handle data responsibly and consistent with this policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Data Retention</h2>
            <p className="text-stone-700">
              We retain your account and practice content while your account is active. You may request deletion, and we will remove your
              content subject to legal and operational requirements. Backups may persist briefly before automatic purge.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Security</h2>
            <p className="text-stone-700">
              We use reasonable technical and organizational measures to protect information. No system is perfectly secure; please use strong
              passwords, keep devices updated, and avoid sharing sensitive information in public or shared environments.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Your Rights</h2>
            <p className="text-stone-700">
              You can request, update, or delete your information by contacting us. We will honor reasonable requests, subject to verification
              and applicable requirements. If you opt out of emails, essential account notices may still be sent.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Children & Health</h2>
            <p className="text-stone-700">
              Our tools are for general wellness and personal reflection. They are not medical advice. If you are under the age required by
              your jurisdiction to consent online, please use the service only with a parent or guardian.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Contact</h2>
            <p className="text-stone-700">
              For privacy questions or requests, contact us via the <Link className="text-primary-600 hover:text-primary-500" href="/contact">contact page</Link>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
