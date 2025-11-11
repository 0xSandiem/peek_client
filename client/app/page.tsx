"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { uploadImage, pollResults, getImageUrl, type AnalysisResult } from "@/lib/api"
import { ImageSlideshow } from "@/components/ImageSlideshow"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ResultsDisplay } from "@/components/ResultsDisplay"

type ViewState = 'idle' | 'uploading' | 'analyzing' | 'results' | 'error'

export default function Home() {
  const images = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deb390cf-a1a1-41dc-a116-26bd31312edb-compressed-24fgJSfSAiPTpIZsGZGzbiK6ngG7T5.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/25d3fc55-3915-44af-8e90-ff082a3c3928-compressed-tpaucojSMCcZYddyvQU8PSSb8JpgPm.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ccc081e4-8059-418d-ad87-a2c4473499d4-compressed-0lyDANUCO0z8ar4SSurR7VKqKbMVwJ.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/e75b49a7-6881-4c93-a506-9c2a7c206a8b-compressed-UEkRaji4IIGFz9NMqKSjpceAilJ1PK.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/b54f8781-379a-4210-a6cc-67e4cc9246fc-compressed-cu2wRScVVRB0LFwZVFXjBWs30lWtV2.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c0018972-afdb-42b1-bc32-7693d288b0b8-compressed-iQ4ErmlOfijJJmjf6RI4sojFZZEUVt.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Steve%20Jobs%20in%20ASCII-S8W77oZpXYAACCqsCOLQp3Se1ZMUdz.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0a81cbe0-14e8-4b91-a9c4-609878f94d30-compressed-Y3YOnHZhDUUIDJ8vPtQr6Rx7Gx6hAh.png",
  ]

  const [viewState, setViewState] = useState<ViewState>('idle')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [analysisId, setAnalysisId] = useState<number | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setViewState('uploading')
      setErrorMessage('')

      const response = await uploadImage(file)
      setAnalysisId(response.id)
      setViewState('analyzing')

      const pollInterval = setInterval(async () => {
        try {
          const result = await pollResults(response.id)

          if (result.status === 'completed') {
            clearInterval(pollInterval)
            setAnalysisResult(result)
            setViewState('results')
          } else if (result.status === 'failed') {
            clearInterval(pollInterval)
            setErrorMessage(result.error || 'Analysis failed')
            setViewState('error')
          }
        } catch (error) {
          clearInterval(pollInterval)
          setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch results')
          setViewState('error')
        }
      }, 2000)

      setTimeout(() => {
        clearInterval(pollInterval)
        if (viewState === 'analyzing') {
          setErrorMessage('Analysis timeout - please try again')
          setViewState('error')
        }
      }, 120000)

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
      setViewState('error')
    }
  }

  const handleReset = () => {
    setViewState('idle')
    setAnalysisResult(null)
    setAnalysisId(null)
    setErrorMessage('')
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b-2 border-black">
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tighter">PEEK</h1>
          {viewState === 'results' && (
            <button
              onClick={handleReset}
              className="border-2 border-black px-4 py-2 text-sm font-bold tracking-tight hover:bg-black hover:text-white transition-colors"
            >
              ANALYZE NEW IMAGE
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-24 pb-20 px-4 md:px-8 container mx-auto">
        {viewState === 'idle' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            <div className="col-span-1 md:col-span-7 space-y-6">
              <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-none">
                IMAGE
                <br />
                ANALYZER
              </h1>
              <div className="space-y-4 max-w-xl">
                <p className="text-lg md:text-xl leading-relaxed">
                  Advanced computer vision technology that extracts meaningful insights from your images.
                </p>
                <ul className="space-y-2 text-sm md:text-base">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Color analysis and dominant palette extraction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Face detection with precise location mapping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Quality metrics: sharpness, blur, and contrast</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Text extraction and word count analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Scene classification with confidence scores</span>
                  </li>
                </ul>
              </div>

              <div className="max-w-xl pt-4">
                <label
                  htmlFor="image-upload"
                  className="block border-2 border-black px-6 py-4 text-center cursor-pointer hover:bg-black hover:text-white transition-colors duration-200"
                >
                  <span className="text-lg font-bold tracking-tight">UPLOAD IMAGE</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={viewState !== 'idle'}
                  />
                </label>
              </div>
            </div>
            <div className="col-span-1 md:col-span-5 flex items-center justify-center">
              <ImageSlideshow images={images} />
            </div>
          </div>
        )}

        {(viewState === 'uploading' || viewState === 'analyzing') && (
          <div className="max-w-2xl mx-auto">
            <LoadingSpinner />
          </div>
        )}

        {viewState === 'results' && analysisResult && analysisId && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">ANALYSIS RESULTS</h2>
            <ResultsDisplay
              result={analysisResult}
              originalImageUrl={getImageUrl(analysisId, 'original')}
              annotatedImageUrl={getImageUrl(analysisId, 'annotated')}
            />
          </div>
        )}

        {viewState === 'error' && (
          <div className="max-w-2xl mx-auto">
            <div className="border-2 border-black p-8 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">ERROR</h2>
              <p className="text-lg">{errorMessage}</p>
              <button
                onClick={handleReset}
                className="border-2 border-black px-6 py-3 font-bold tracking-tight hover:bg-black hover:text-white transition-colors"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 bg-black text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-2">PEEK</h3>
              <p className="text-sm text-gray-400">
                Advanced image analysis powered by computer vision
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight mb-2">CAPABILITIES</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Color Analysis</li>
                <li>Face Detection</li>
                <li>Quality Metrics</li>
                <li>Text Extraction</li>
                <li>Scene Classification</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight mb-2">TECHNOLOGY</h4>
              <p className="text-sm text-gray-400">
                Built with OpenCV, Flask, and Next.js for fast, accurate image insights
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-sm text-gray-400">© 2025 Peek. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
