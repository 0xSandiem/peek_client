const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface AnalysisResult {
  id: number
  status: 'processing' | 'completed' | 'failed'
  insights?: {
    dominant_colors: string[]
    brightness: number
    faces_detected: number
    face_locations: Array<{ x: number; y: number; width: number; height: number }>
    text_found: boolean
    extracted_text: string | null
    word_count: number
    sharpness_score: number
    blur_level: string
    contrast_score: number
    quality_score: number
    scene_type: string
    scene_confidence: number
  }
  error?: string
}

export async function uploadImage(file: File): Promise<{ id: number; status: string }> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  return response.json()
}

export async function pollResults(id: number): Promise<AnalysisResult> {
  const response = await fetch(`${API_URL}/api/results/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch results')
  }

  return response.json()
}

export function getImageUrl(id: number, type: 'original' | 'annotated'): string {
  return `${API_URL}/api/image/${id}/${type}`
}
