import FeaturedArticles from '@/components/FeaturedArticles'
import CategorySection from '@/components/CategorySection'
import AdBanner from '@/components/AdBanner'
import NewsletterSignup from '@/components/NewsletterSignup'

export default function Home() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-thread-navy to-thread-dark-navy text-white p-8 md:p-12 rounded-lg shadow-lg">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-serif">
            Peoples Thread
          </h1>
          <p className="text-xl md:text-2xl mb-6 font-light">
            A media project amplifying working class voices and socialist ideals
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
              Working Class Voices
            </span>
            <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
              Socialist Ideals
            </span>
            <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
              Labor Rights
            </span>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <AdBanner slot="homepage-top" />

      {/* Featured Articles */}
      <FeaturedArticles />

      {/* Ad Banner */}
      <AdBanner slot="homepage-middle" />

      {/* Category Sections */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <CategorySection 
          title="Working Class Politics" 
          category="politics"
          color="bg-navy-50 border-thread-navy"
        />
        <CategorySection 
          title="Social Justice" 
          category="social-justice"
          color="bg-primary-50 border-thread-blue"
        />
        <CategorySection 
          title="Labor Rights" 
          category="labor"
          color="bg-navy-100 border-thread-dark-navy"
        />
      </div>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Bottom Ad */}
      <AdBanner slot="homepage-bottom" />
      </div>
    </div>
  )
}