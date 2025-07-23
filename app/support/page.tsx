import Link from 'next/link'

export default function SupportPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-pbs-gray-900 mb-6">
            Support Independent Journalism
          </h1>
          <p className="text-xl text-pbs-gray-700 font-sans leading-relaxed max-w-3xl mx-auto">
            Help us continue providing independent, progressive journalism that amplifies 
            working class voices and holds power accountable.
          </p>
        </header>

        {/* Why Support Us */}
        <section className="mb-12">
          <h2 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-8">
            Why Your Support Matters
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-pbs-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">
                Editorial Independence
              </h3>
              <p className="text-pbs-gray-700 font-sans">
                Reader support allows us to maintain complete editorial independence, 
                free from corporate influence and special interests.
              </p>
            </div>
            <div className="bg-pbs-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">
                Investigative Reporting
              </h3>
              <p className="text-pbs-gray-700 font-sans">
                Your contributions fund in-depth investigations into issues that 
                affect working families and marginalized communities.
              </p>
            </div>
            <div className="bg-pbs-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">
                Community Coverage
              </h3>
              <p className="text-pbs-gray-700 font-sans">
                We cover local stories and grassroots movements that mainstream 
                media often overlooks.
              </p>
            </div>
            <div className="bg-pbs-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">
                Free Access
              </h3>
              <p className="text-pbs-gray-700 font-sans">
                Your support helps us keep our journalism free and accessible 
                to everyone, regardless of their ability to pay.
              </p>
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="mb-12">
          <h2 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-8 text-center">
            Ways to Support
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-pbs-blue text-white p-8 rounded-lg text-center">
              <h3 className="text-2xl font-headline font-bold mb-4">Monthly</h3>
              <p className="text-4xl font-headline font-bold mb-4">$10</p>
              <p className="mb-6 opacity-90">
                Sustaining support that helps us plan long-term investigations and coverage.
              </p>
              <button className="bg-white text-pbs-blue px-6 py-3 font-sans font-semibold hover:bg-pbs-gray-100 transition-colors w-full">
                Support Monthly
              </button>
            </div>
            <div className="bg-pbs-gray-100 p-8 rounded-lg text-center">
              <h3 className="text-2xl font-headline font-bold mb-4 text-pbs-gray-900">One-Time</h3>
              <p className="text-4xl font-headline font-bold mb-4 text-pbs-gray-900">$25</p>
              <p className="mb-6 text-pbs-gray-700">
                A one-time contribution to support our current reporting efforts.
              </p>
              <button className="bg-pbs-blue text-white px-6 py-3 font-sans font-semibold hover:bg-pbs-dark-blue transition-colors w-full">
                Donate Once
              </button>
            </div>
            <div className="bg-pbs-gray-100 p-8 rounded-lg text-center">
              <h3 className="text-2xl font-headline font-bold mb-4 text-pbs-gray-900">Annual</h3>
              <p className="text-4xl font-headline font-bold mb-4 text-pbs-gray-900">$100</p>
              <p className="mb-6 text-pbs-gray-700">
                Annual support with special recognition and exclusive updates.
              </p>
              <button className="bg-pbs-blue text-white px-6 py-3 font-sans font-semibold hover:bg-pbs-dark-blue transition-colors w-full">
                Support Annually
              </button>
            </div>
          </div>
        </section>

        {/* Other Ways to Help */}
        <section className="mb-12">
          <h2 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-8">
            Other Ways to Help
          </h2>
          <div className="bg-pbs-gray-50 p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">
                  Share Our Stories
                </h3>
                <p className="text-pbs-gray-700 font-sans mb-4">
                  Help amplify our reporting by sharing articles on social media and 
                  with your networks.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">
                  Send Story Tips
                </h3>
                <p className="text-pbs-gray-700 font-sans mb-4">
                  Know of a story we should cover? Send tips to editor@peoplesthread.com
                </p>
              </div>
            </div>
          </div>
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