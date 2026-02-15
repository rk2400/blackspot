import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-6">Terms of Service</h1>
        <p className="text-stone-600 mb-8">
          By using our website and purchasing our products, you agree to the following terms.
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Orders</h2>
            <p className="text-stone-700">
              Access to tools may be rolled out gradually. We reserve the right to refuse or revoke access due to abuse, suspected fraud, or misuse.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Pricing and Discounts</h2>
            <p className="text-stone-700">
              Prices are listed in INR and may change without notice. Coupons and promotions may have specific eligibility criteria and expiration dates.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Shipping</h2>
            <p className="text-stone-700">
              We ship within India. Delivery timelines are estimates and may vary due to courier operations and regional factors.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Returns</h2>
            <p className="text-stone-700">
              Returns are accepted within 7 days for unused items in original packaging. Please refer to our <Link className="text-primary-600 hover:text-primary-500" href="/shipping">Shipping & Returns</Link> page for details.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Limitation of Liability</h2>
            <p className="text-stone-700">
              To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of our products or services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-medium text-stone-900 mb-2">Intellectual Property</h2>
            <p className="text-stone-700">
              All content, logos, and designs on this website are owned by The BlackSpot Project. Do not copy or distribute without permission.
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
