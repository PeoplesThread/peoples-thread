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
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (err) {
        console.error('AdSense error:', err)
      }
    }
  }, [adsenseId, slot]) // Added slot to dependencies to re-trigger when slot changes

  if (!adsenseId) {
    // Show placeholder when AdSense is not configured
    return (
      <div className="adsense-container">
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">Advertisement Space</p>
          <p className="text-gray-400 text-xs mt-1">Configure AdSense to show ads</p>
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