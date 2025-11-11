"use client"

import { AnalysisResult } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ResultsDisplayProps {
  result: AnalysisResult
  originalImageUrl: string
  annotatedImageUrl?: string
}

export function ResultsDisplay({ result, originalImageUrl, annotatedImageUrl }: ResultsDisplayProps) {
  const insights = result.insights

  if (!insights) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Image Display */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border-2 border-black">
          <img
            src={originalImageUrl}
            alt="Original"
            className="w-full h-auto grayscale"
          />
          <div className="p-2 border-t-2 border-black bg-white">
            <p className="text-sm font-bold tracking-tight">ORIGINAL</p>
          </div>
        </div>
        {insights.faces_detected > 0 && annotatedImageUrl && (
          <div className="border-2 border-black">
            <img
              src={annotatedImageUrl}
              alt="With face detection"
              className="w-full h-auto grayscale"
            />
            <div className="p-2 border-t-2 border-black bg-white">
              <p className="text-sm font-bold tracking-tight">FACES DETECTED</p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Colors */}
        <Card className="border-2 border-black rounded-none shadow-none">
          <CardHeader className="border-b-2 border-black">
            <CardTitle className="text-lg font-bold tracking-tight">DOMINANT COLORS</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {insights.dominant_colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2 border-2 border-black p-2">
                  <div
                    className="w-8 h-8 border-2 border-black"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-mono">{color}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quality Metrics */}
        <Card className="border-2 border-black rounded-none shadow-none">
          <CardHeader className="border-b-2 border-black">
            <CardTitle className="text-lg font-bold tracking-tight">QUALITY METRICS</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Overall Quality</span>
              <Badge className="bg-black text-white hover:bg-black rounded-none">
                {insights.quality_score.toFixed(1)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Sharpness</span>
              <Badge className="bg-black text-white hover:bg-black rounded-none">
                {insights.sharpness_score.toFixed(1)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Contrast</span>
              <Badge className="bg-black text-white hover:bg-black rounded-none">
                {insights.contrast_score.toFixed(1)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Blur Level</span>
              <Badge className="bg-white text-black border-2 border-black hover:bg-white rounded-none">
                {insights.blur_level.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Brightness</span>
              <span className="text-sm">{insights.brightness}/255</span>
            </div>
          </CardContent>
        </Card>

        {/* Face Detection */}
        <Card className="border-2 border-black rounded-none shadow-none">
          <CardHeader className="border-b-2 border-black">
            <CardTitle className="text-lg font-bold tracking-tight">FACE DETECTION</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-4">
              <div className="text-5xl font-bold tracking-tight mb-2">
                {insights.faces_detected}
              </div>
              <p className="text-sm text-gray-600">
                {insights.faces_detected === 1 ? 'face detected' : 'faces detected'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scene Classification */}
        <Card className="border-2 border-black rounded-none shadow-none">
          <CardHeader className="border-b-2 border-black">
            <CardTitle className="text-lg font-bold tracking-tight">SCENE TYPE</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-4">
              <div className="text-2xl font-bold tracking-tight mb-2">
                {insights.scene_type.toUpperCase()}
              </div>
              <p className="text-sm text-gray-600">
                {(insights.scene_confidence * 100).toFixed(1)}% confidence
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Text Detection */}
        {insights.text_found && (
          <Card className="border-2 border-black rounded-none shadow-none md:col-span-2">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="text-lg font-bold tracking-tight">
                TEXT EXTRACTION ({insights.word_count} words)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="bg-gray-50 border-2 border-black p-4">
                <p className="text-sm whitespace-pre-wrap font-mono">
                  {insights.extracted_text || 'No text extracted'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
