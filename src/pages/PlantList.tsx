import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Leaf } from 'lucide-react'
import { getAllPlants, deletePlant } from '@/data/db'
import type { Plant } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'

const TYPE_COLORS: Record<string, string> = {
  tree: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  shrub: 'bg-lime-100 text-lime-800 border-lime-200',
  perennial: 'bg-teal-100 text-teal-800 border-teal-200',
  annual: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  groundcover: 'bg-green-100 text-green-800 border-green-200',
  vine: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  other: 'bg-stone-100 text-stone-700 border-stone-200',
}

export function PlantList() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setPlants(await getAllPlants())
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const handleDelete = async (id: string) => {
    await deletePlant(id)
    setPlants((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading plants…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plants</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{plants.length} plant{plants.length !== 1 ? 's' : ''} in your garden</p>
        </div>
        <Button asChild>
          <Link to="/plants/new">
            <Plus className="h-4 w-4" />
            Add Plant
          </Link>
        </Button>
      </div>

      {plants.length === 0 ? (
        <EmptyState
          icon={<Leaf className="h-12 w-12" />}
          title="No plants yet"
          description="Start building your garden by adding your first plant."
          action={
            <Button asChild>
              <Link to="/plants/new">
                <Plus className="h-4 w-4" /> Add Your First Plant
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <Card key={plant.id} className="group hover:shadow-md transition-shadow">
              {plant.photos[0] && (
                <div className="h-36 overflow-hidden rounded-t-xl">
                  <img src={plant.photos[0]} alt={plant.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{plant.name}</CardTitle>
                  <Badge className={TYPE_COLORS[plant.type]} variant="outline">
                    {plant.type}
                  </Badge>
                </div>
                {plant.species && (
                  <p className="text-xs text-muted-foreground italic">{plant.species}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {plant.datePlanted && (
                  <p className="text-xs text-muted-foreground">
                    Planted: {new Date(plant.datePlanted).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
                {plant.companions.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {plant.companions.length} companion{plant.companions.length !== 1 ? 's' : ''}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/plants/${plant.id}`}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
                        Delete
                      </Button>
                    }
                    title="Delete plant?"
                    description={`Are you sure you want to delete "${plant.name}"? This cannot be undone.`}
                    onConfirm={() => handleDelete(plant.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
