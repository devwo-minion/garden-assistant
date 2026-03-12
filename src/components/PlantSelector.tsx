import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Plant } from '@/types'

interface PlantSelectorProps {
  plants: Plant[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function PlantSelector({ plants, selectedIds, onChange }: PlantSelectorProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (plants.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No plants added yet.</p>
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {plants.map((plant) => (
        <div key={plant.id} className="flex items-center gap-3">
          <Checkbox
            id={`plant-${plant.id}`}
            checked={selectedIds.includes(plant.id)}
            onCheckedChange={() => toggle(plant.id)}
          />
          <Label htmlFor={`plant-${plant.id}`} className="flex items-center gap-2 cursor-pointer font-normal">
            {plant.name}
            <Badge variant="outline" className="text-xs capitalize">
              {plant.type}
            </Badge>
          </Label>
        </div>
      ))}
    </div>
  )
}
