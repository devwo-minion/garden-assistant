import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAllPlants, getPlantById, savePlant } from '@/data/db'
import type { Plant, PlantType, Companion } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { PhotoUploader } from '@/components/PhotoUploader'

const PLANT_TYPES: PlantType[] = ['tree', 'shrub', 'perennial', 'annual', 'groundcover', 'vine', 'other']

interface FormData {
  name: string
  species: string
  type: PlantType
  datePlanted: string
  notes: string
  companions: Companion[]
  photos: string[]
}

const DEFAULT_FORM: FormData = {
  name: '',
  species: '',
  type: 'other',
  datePlanted: '',
  notes: '',
  companions: [],
  photos: [],
}

export function PlantForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormData>(DEFAULT_FORM)
  const [allPlants, setAllPlants] = useState<Plant[]>([])
  const [notFound, setNotFound] = useState(false)
  const [errors, setErrors] = useState<{ name?: string }>({})

  useEffect(() => {
    void (async () => {
      const plants = await getAllPlants()
      setAllPlants(plants)
      if (id) {
        const plant = await getPlantById(id)
        if (!plant) { setNotFound(true); return }
        setForm({
          name: plant.name,
          species: plant.species,
          type: plant.type,
          datePlanted: plant.datePlanted,
          notes: plant.notes,
          companions: plant.companions,
          photos: plant.photos,
        })
      }
    })()
  }, [id])

  const otherPlants = allPlants.filter((p) => p.id !== id)

  const toggleCompanion = (plantId: string) => {
    setForm((prev) => {
      const exists = prev.companions.find((c) => c.plantId === plantId)
      if (exists) return { ...prev, companions: prev.companions.filter((c) => c.plantId !== plantId) }
      return { ...prev, companions: [...prev.companions, { plantId, notes: '' }] }
    })
  }

  const updateCompanionNotes = (plantId: string, notes: string) => {
    setForm((prev) => ({
      ...prev,
      companions: prev.companions.map((c) => (c.plantId === plantId ? { ...c, notes } : c)),
    }))
  }

  const validate = () => {
    const e: { name?: string } = {}
    if (!form.name.trim()) e.name = 'Name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await savePlant({ ...(id ? { id } : {}), ...form })
    navigate('/plants')
  }

  if (notFound) return <div className="py-16 text-center text-muted-foreground">Plant not found.</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit Plant' : 'Add Plant'}</h1>

      <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-5">
        {/* Basic Info */}
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Basic Info</h2>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Peach Tree 1"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="species">Species</Label>
            <Input
              id="species"
              value={form.species}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
              placeholder="e.g. Prunus persica"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as PlantType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="datePlanted">Date Planted</Label>
              <Input
                id="datePlanted"
                type="date"
                value={form.datePlanted}
                onChange={(e) => setForm({ ...form, datePlanted: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Observations, care notes, variety details…"
              rows={3}
            />
          </div>
        </div>

        {/* Companion Planting */}
        {otherPlants.length > 0 && (
          <div className="space-y-4 rounded-xl border bg-card p-5">
            <div>
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Companion Planting</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Select plants that synergize with this one</p>
            </div>
            <div className="space-y-3">
              {otherPlants.map((plant) => {
                const companion = form.companions.find((c) => c.plantId === plant.id)
                return (
                  <div key={plant.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`comp-${plant.id}`}
                        checked={Boolean(companion)}
                        onCheckedChange={() => toggleCompanion(plant.id)}
                      />
                      <Label htmlFor={`comp-${plant.id}`} className="font-normal cursor-pointer">
                        {plant.name}
                        <span className="text-muted-foreground text-xs ml-1.5 capitalize">({plant.type})</span>
                      </Label>
                    </div>
                    {companion && (
                      <Input
                        className="ml-7"
                        placeholder="Relationship notes (e.g. nitrogen fixer, dynamic accumulator…)"
                        value={companion.notes}
                        onChange={(e) => updateCompanionNotes(plant.id, e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Photos */}
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Photos</h2>
          <PhotoUploader
            photos={form.photos}
            onChange={(photos) => setForm({ ...form, photos })}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            {isEdit ? 'Save Changes' : 'Add Plant'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/plants')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
