import Link from 'next/link'
import NewsletterSignup from '@/components/NewsletterSignup'

export default function NewsletterPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-pbs-gray-900 mb-6">
            Newsletter
          </h1>
          <p className="text-xl text-pbs-gray-700 font-sans leading-relaxed max-w-3xl mx-auto">
            Stay informed with our weekly newsletter featuring the latest in progressive politics, 
            labor rights, and social justice.
          </p>
        </header>

        {/* Newsletter Signup */}
        <div className="mb-12">
          <NewsletterSignup />
        </div>

        {/* What You'll Get */}
        <section className="mb-12">
          <h2 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-8 text-center">
            What You'll Get
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pbs-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📰</span>
              </div>
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">
                Weekly Roundup
              </h3>
              <p className="text-pbs-gray-700 font-sans">
                The most important stories of the week, curated by our editorial team.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pbs-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">
                Deep Dives
              </h3>
              <p className="text-pbs-gray-700 font-sans">
                In-depth analysis of complex issues affecting working families.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pbs-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">
                Breaking News
              </h3>
              <p className="text-pbs-gray-700 font-sans">
                Urgent updates on developing stories that matter to our community.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Notice */}
        <section className="bg-pbs-gray-50 p-8 rounded-lg mb-12">
          <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-4">
            Your Privacy Matters
          </h3>
          <p className="text-pbs-gray-700 font-sans mb-4">
            We respect your privacy and will never share your email address with third parties. 
            You can unsubscribe at any time with a single click.
          </p>
          <p className="text-sm text-pbs-gray-600 font-sans">
            By subscribing, you agree to receive our newsletter and occasional updates about 
            Peoples Thread. We typically send one email per week.
          </p>
        </section>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-block bg-pbs-blue text-white px-8 py-3 font-sans font-semibold hover:bg-pbs-dark-blue transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}