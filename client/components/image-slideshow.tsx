"use client"

import { useState, useEffect } from 'react'

interface ImageSlideshowProps {
  images: string[]
}

export function ImageSlideshow({ images }: ImageSlideshowProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="relative w-full aspect-square bg-white overflow-hidden border-2 border-black">
      {images.map((src, index) => (
        <img
          key={index}
          src={src || '/placeholder.svg'}
          alt={`Slide ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 grayscale ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}
