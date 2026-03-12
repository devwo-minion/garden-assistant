import { useRef } from 'react'
import { X, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PhotoUploaderProps {
  photos: string[]
  onChange: (photos: string[]) => void
}

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
    )
    Promise.all(readers).then((newPhotos) => {
      onChange([...photos, ...newPhotos])
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  const remove = (idx: number) => {
    onChange(photos.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {photos.map((src, idx) => (
          <div key={idx} className="relative group">
            <img
              src={src}
              alt={`Photo ${idx + 1}`}
              className="h-20 w-20 object-cover rounded-md border"
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        <ImagePlus className="h-4 w-4" />
        Add Photos
      </Button>
    </div>
  )
}
