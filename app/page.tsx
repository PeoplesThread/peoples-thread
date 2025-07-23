import dynamic from 'next/dynamic'
import AdBanner from '@/components/AdBanner'
import NewsletterSignup from '@/components/NewsletterSignup'

// Lazy load heavy components to improve initial page load
const FeaturedArticles = dynamic(() => import('@/components/FeaturedArticles'), {
  loading: () => (
    <section className="mb-12">
      <h2 className="text-2xl font-headline font-bold mb-8 text-pbs-gray-900 border-b border-pbs-gray-200 pb-3">
        Featured Stories
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-pbs-gray-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-5">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
})

const CategorySection = dynamic(() => import('@/components/CategorySection'), {
  loading: () => (
    <div className="bg-white border-l-4 border-gray-300 p-6 animate-pulse">
      <div className="h-6 bg-gray-300 rounded mb-4"></div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded"></div>
        ))}
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <div className="bg-pbs-bg-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - PBS NewsHour style */}
        <section className="mb-12">
          <div className="bg-white border-l-4 border-pbs-blue p-8 md:p-12 shadow-sm">
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-pbs-gray-900 leading-tight">
              Peoples Thread
            </h1>
            <p className="text-lg md:text-xl mb-6 text-pbs-gray-700 font-sans leading-relaxed max-w-3xl">
              Independent journalism amplifying working class voices and progressive ideals
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-pbs-gray-100 text-pbs-gray-700 px-3 py-1 text-sm font-sans font-medium">
                Working Class Voices
              </span>
              <span className="bg-pbs-gray-100 text-pbs-gray-700 px-3 py-1 text-sm font-sans font-medium">
                Progressive Politics
              </span>
              <span className="bg-pbs-gray-100 text-pbs-gray-700 px-3 py-1 text-sm font-sans font-medium">
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

        {/* Category Sections - PBS grid style with sidebar ad */}
        <section className="mb-12">
          <h2 className="text-2xl font-headline font-bold mb-8 text-pbs-gray-900 border-b border-pbs-gray-200 pb-3">
            Latest Coverage
          </h2>
          <div className="grid lg:grid-cols-4 md:grid-cols-3 gap-8">
            <div className="md:col-span-3">
              <div className="grid md:grid-cols-3 gap-8">
                <CategorySection 
                  title="Politics" 
                  category="politics"
                  color="bg-white border-l-4 border-pbs-politics"
                />
                <CategorySection 
                  title="Social Justice" 
                  category="social-justice"
                  color="bg-white border-l-4 border-pbs-social-justice"
                />
                <CategorySection 
                  title="Labor Rights" 
                  category="labor"
                  color="bg-white border-l-4 border-pbs-labor"
                />
              </div>
            </div>
            
            {/* Sidebar Ad */}
            <div className="lg:block hidden">
              <div className="sticky top-4">
                <AdBanner 
                  slot="homepage-sidebar" 
                  format="vertical"
                  style={{ display: 'block', width: '300px', height: '600px' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <NewsletterSignup />

        {/* Bottom Ad */}
        <AdBanner slot="homepage-bottom" />
      </div>
    </div>
  )
}