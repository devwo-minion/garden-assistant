import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAllPlants, getTaskById, saveTask } from '@/data/db'
import type { Plant } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PlantSelector } from '@/components/PlantSelector'

interface FormData {
  title: string
  dueDate: string
  description: string
  plantIds: string[]
}

const DEFAULT_FORM: FormData = { title: '', dueDate: '', description: '', plantIds: [] }

export function TaskForm() {
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
        const task = await getTaskById(id)
        if (!task) { setNotFound(true); return }
        setForm({ title: task.title, dueDate: task.dueDate, description: task.description, plantIds: task.plantIds })
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
    await saveTask({ ...(id ? { id } : {}), ...form })
    navigate('/tasks')
  }

  if (notFound) return <div className="py-16 text-center text-muted-foreground">Task not found.</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit Task' : 'Add Task'}</h1>

      <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-5">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Task Details</h2>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Apply dormant spray, Mulch beds…"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Notes, materials needed, method…"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Plants</h2>
          <PlantSelector plants={plants} selectedIds={form.plantIds} onChange={(ids) => setForm({ ...form, plantIds: ids })} />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">{isEdit ? 'Save Changes' : 'Add Task'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
