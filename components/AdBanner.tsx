'use client'

import { useEffect } from 'react'

interface AdBannerProps {
  slot: string
  format?: string
  responsive?: boolean
  style?: React.CSSProperties
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  slot, 
  format = 'auto', 
  responsive = true,
  style = { display: 'block' }
}) => {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    if (typeof window !== 'undefined' && adsenseId) {
      // Delay AdSense initialization to not block page rendering
      const timer = setTimeout(() => {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (err) {
          console.error('AdSense error:', err)
        }
      }, 100) // Small delay to let page render first
      
      return () => clearTimeout(timer)
    }
  }, [adsenseId, slot])

  if (!adsenseId) {
    // Subtle placeholder that doesn't interfere with reading
    const getPlaceholderHeight = () => {
      switch (format) {
        case 'horizontal':
          return 'h-20'
        case 'rectangle':
          return 'h-48'
        default:
          return 'h-24'
      }
    }

    return (
      <div className="adsense-container my-4">
        <div className={`bg-gray-50 border border-gray-200 rounded p-4 text-center ${getPlaceholderHeight()} flex items-center justify-center`}>
          <div>
            <p className="text-gray-400 text-xs font-sans">Advertisement</p>
            <p className="text-gray-300 text-xs font-sans mt-1">{slot}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="adsense-container">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  )
}

export default AdBanner