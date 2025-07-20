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
    { name: 'Labor Rights', href: '/category/labor' },
    { name: 'About', href: '/about' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-white shadow-sm border-b-2 border-thread-navy">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Image
                src="/logo.jpg"
                alt="Peoples Thread Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900 font-serif tracking-tight">Peoples Thread</h1>
              <p className="text-sm text-navy-600 font-medium">Amplifying working class voices</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded ${
                  isActive(item.href)
                    ? 'text-thread-navy bg-navy-50'
                    : 'text-navy-700 hover:text-thread-navy hover:bg-navy-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>



          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-navy-700 hover:text-thread-navy hover:bg-navy-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-navy-200">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.href)
                      ? 'text-thread-navy bg-navy-50'
                      : 'text-navy-700 hover:text-thread-navy hover:bg-navy-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header