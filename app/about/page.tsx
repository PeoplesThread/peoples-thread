import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-pbs-gray-900 mb-6">
            About Peoples Thread
          </h1>
          <p className="text-xl text-pbs-gray-700 font-sans leading-relaxed max-w-3xl mx-auto">
            Independent journalism amplifying working class voices and progressive ideals
          </p>
        </header>

        {/* Mission Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-6">Our Mission</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-pbs-gray-800 leading-relaxed font-sans mb-6">
              Peoples Thread is dedicated to providing independent, progressive journalism that centers 
              working class perspectives and social justice issues. We believe in the power of informed 
              communities to create meaningful change.
            </p>
            <p className="text-lg text-pbs-gray-800 leading-relaxed font-sans mb-6">
              Our coverage focuses on labor rights, social justice, environmental issues, and progressive 
              politics - stories that matter to working families but often get overlooked by mainstream media.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-pbs-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">Independence</h3>
              <p className="text-pbs-gray-700 font-sans">
                We maintain editorial independence, free from corporate influence and special interests.
              </p>
            </div>
            <div className="bg-pbs-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">Accuracy</h3>
              <p className="text-pbs-gray-700 font-sans">
                We are committed to factual, well-researched reporting that serves the public interest.
              </p>
            </div>
            <div className="bg-pbs-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">Equity</h3>
              <p className="text-pbs-gray-700 font-sans">
                We amplify marginalized voices and cover stories that promote social and economic justice.
              </p>
            </div>
            <div className="bg-pbs-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-headline font-semibold text-pbs-gray-900 mb-3">Community</h3>
              <p className="text-pbs-gray-700 font-sans">
                We believe journalism should serve communities and foster democratic participation.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-headline font-bold text-pbs-gray-900 mb-6">Contact Us</h2>
          <div className="bg-pbs-blue text-white p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-headline font-semibold mb-4">Editorial</h3>
                <p className="font-sans mb-2">editor@peoplesthread.com</p>
                <p className="font-sans text-sm opacity-90">Story tips, press releases, editorial inquiries</p>
              </div>
              <div>
                <h3 className="text-xl font-headline font-semibold mb-4">Support</h3>
                <p className="font-sans mb-2">support@peoplesthread.com</p>
                <p className="font-sans text-sm opacity-90">Technical issues, subscription questions</p>
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