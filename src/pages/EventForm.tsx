import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAllPlants, getEventById, saveEvent } from '@/data/db'
import type { Plant } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PlantSelector } from '@/components/PlantSelector'
import { PhotoUploader } from '@/components/PhotoUploader'

interface FormData {
  date: string
  title: string
  description: string
  plantIds: string[]
  photos: string[]
}

const today = new Date().toISOString().split('T')[0]

const DEFAULT_FORM: FormData = {
  date: today,
  title: '',
  description: '',
  plantIds: [],
  photos: [],
}

export function EventForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormData>(DEFAULT_FORM)
  const [plants, setPlants] = useState<Plant[]>([])
  const [notFound, setNotFound] = useState(false)
  const [errors, setErrors] = useState<{ title?: string }>({})

  useEffect(() => {
    void (async () => {
      const ps = await getAllPlants()
      setPlants(ps)
      if (id) {
        const event = await getEventById(id)
        if (!event) { setNotFound(true); return }
        setForm({ date: event.date, title: event.title, description: event.description, plantIds: event.plantIds, photos: event.photos })
      }
    })()
  }, [id])

  const validate = () => {
    const e: { title?: string } = {}
    if (!form.title.trim()) e.title = 'Title is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await saveEvent({ ...(id ? { id } : {}), ...form })
    navigate('/events')
  }

  if (notFound) return <div className="py-16 text-center text-muted-foreground">Event not found.</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit Event' : 'Log Event'}</h1>

      <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-5">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Event Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Spring pruning, Compost application…"
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what you did, observations, results…"
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Plants Involved</h2>
          <PlantSelector plants={plants} selectedIds={form.plantIds} onChange={(ids) => setForm({ ...form, plantIds: ids })} />
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Photos</h2>
          <PhotoUploader photos={form.photos} onChange={(photos) => setForm({ ...form, photos })} />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">{isEdit ? 'Save Changes' : 'Log Event'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/events')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
