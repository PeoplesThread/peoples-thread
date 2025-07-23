'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Politics', href: '/category/politics' },
    { name: 'Social Justice', href: '/category/social-justice' },
    { name: 'Labor', href: '/category/labor' },
    { name: 'Environment', href: '/category/environment' },
    { name: 'Economy', href: '/category/economy' },
    { name: 'Healthcare', href: '/category/healthcare' },
    { name: 'About', href: '/about' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-white">
      {/* Top utility bar - PBS style */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-sans">Independent Progressive Journalism</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/newsletter" className="text-gray-600 hover:text-pbs-blue transition-colors font-sans">
                Newsletter
              </Link>
              <Link href="/support" className="text-pbs-blue hover:text-pbs-dark-blue transition-colors font-sans font-medium">
                Support Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - PBS NewsHour style */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo - PBS style with original logo */}
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-sm overflow-hidden">
                <Image
                  src="/logo.jpg"
                  alt="Peoples Thread Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="text-4xl font-headline font-bold text-gray-900 tracking-tight leading-none">
                  Peoples Thread
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-pbs-blue rounded-full"></div>
                  <span className="text-sm text-gray-600 font-sans uppercase tracking-wide">
                    News
                  </span>
                </div>
              </div>
            </Link>

            {/* Right Side - PBS style */}
            <div className="flex items-center space-x-6">
              {/* Search Bar - Desktop */}
              <div className="hidden lg:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-80 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pbs-blue focus:border-transparent font-sans text-sm bg-gray-50"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pbs-blue">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 text-gray-700 hover:text-pbs-blue"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - PBS NewsHour style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden lg:flex items-center py-0">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-sans font-medium transition-all duration-200 py-4 px-6 border-b-3 relative ${
                  isActive(item.href)
                    ? 'text-pbs-blue border-pbs-blue bg-blue-50'
                    : 'text-gray-700 border-transparent hover:text-pbs-blue hover:border-gray-300 hover:bg-gray-50'
                } ${index === 0 ? 'pl-0' : ''}`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* More dropdown - PBS style */}
            <div className="ml-auto flex items-center space-x-4">
              <div className="text-xs text-gray-500 font-sans uppercase tracking-wide">
                More
              </div>
              <button className="text-gray-400 hover:text-pbs-blue">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation - PBS style */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            {/* Mobile Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pbs-blue focus:border-transparent font-sans text-sm bg-gray-50"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Mobile Navigation Links */}
            <nav className="space-y-0">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-0 py-4 text-base font-sans font-medium border-b border-gray-100 transition-colors ${
                    isActive(item.href)
                      ? 'text-pbs-blue'
                      : 'text-gray-700 hover:text-pbs-blue'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header