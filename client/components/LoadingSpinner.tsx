import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 border-2 border-black">
      <Loader2 className="w-16 h-16 animate-spin" />
      <div className="text-center">
        <h3 className="text-xl font-bold tracking-tight mb-2">ANALYZING IMAGE</h3>
        <p className="text-sm text-gray-600">Processing your image with computer vision...</p>
      </div>
    </div>
  )
}
