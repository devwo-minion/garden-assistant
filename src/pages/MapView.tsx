import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, MapPin, X } from 'lucide-react'
import { getAllPlants, savePlant, getSettings, saveSettings } from '@/data/db'
import type { Plant, Settings } from '@/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export function MapView() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [placingPlantId, setPlacingPlantId] = useState<string>('')
  const [_tooltip, setTooltip] = useState<{ plant: Plant; x: number; y: number } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ plant: Plant; x: number; y: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const [ps, s] = await Promise.all([getAllPlants(), getSettings()])
    setPlants(ps)
    setSettings(s)
  }

  useEffect(() => { void load() }, [])

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const updated = { ...(settings ?? { growingZone: '', propertyName: 'My Garden' }), mapImage: reader.result as string }
      await saveSettings(updated)
      setSettings(updated)
    }
    reader.readAsDataURL(file)
  }

  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingPlantId || !mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const plant = plants.find((p) => p.id === placingPlantId)
    if (!plant) return
    const updated = await savePlant({ ...plant, mapX: x, mapY: y })
    setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setPlacingPlantId('')
  }

  const handleUnpin = async (plant: Plant) => {
    const updated = await savePlant({ ...plant, mapX: undefined, mapY: undefined })
    setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setContextMenu(null)
  }

  const pinnedPlants = plants.filter((p) => p.mapX !== undefined && p.mapY !== undefined)
  const unpinnedPlants = plants.filter((p) => p.mapX === undefined || p.mapY === undefined)
  const placingOptions = plants.filter((p) => p.id !== '')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Garden Map</h1>
          <p className="text-muted-foreground text-sm">{pinnedPlants.length} of {plants.length} plants placed</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Place plant mode */}
          <div className="flex items-center gap-2">
            <Select value={placingPlantId} onValueChange={setPlacingPlantId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select plant to place…" />
              </SelectTrigger>
              <SelectContent>
                {unpinnedPlants.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Unplaced</div>
                    {unpinnedPlants.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </>
                )}
                {pinnedPlants.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Reposition</div>
                    {pinnedPlants.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </>
                )}
                {placingOptions.length === 0 && (
                  <div className="px-2 py-2 text-xs text-muted-foreground">No plants added yet</div>
                )}
              </SelectContent>
            </Select>
            {placingPlantId && (
              <Button variant="outline" size="sm" onClick={() => setPlacingPlantId('')}>
                Cancel
              </Button>
            )}
          </div>
          {/* Upload map */}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMapUpload} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            {settings?.mapImage ? 'Replace Map' : 'Upload Map'}
          </Button>
        </div>
      </div>

      {placingPlantId && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm text-primary font-medium">
          <MapPin className="inline h-4 w-4 mr-1.5" />
          Click anywhere on the map to place "{plants.find(p => p.id === placingPlantId)?.name}"
        </div>
      )}

      {/* Map container */}
      <div
        className="relative w-full border rounded-xl overflow-auto bg-muted/30"
        style={{ maxHeight: 'calc(100vh - 280px)', minHeight: '400px' }}
        onClick={(e) => { void handleMapClick(e); setContextMenu(null) }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {settings?.mapImage ? (
          <div ref={mapRef} className="relative inline-block w-full">
            <img
              src={settings.mapImage}
              alt="Garden map"
              className="w-full h-auto block"
              style={{ cursor: placingPlantId ? 'crosshair' : 'default' }}
              draggable={false}
            />
            {/* Plant pins */}
            {pinnedPlants.map((plant) => (
              <div
                key={plant.id}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `${plant.mapX}%`, top: `${plant.mapY}%` }}
                onMouseEnter={() => setTooltip({ plant, x: plant.mapX!, y: plant.mapY! })}
                onMouseLeave={() => setTooltip(null)}
                onContextMenu={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setContextMenu({ plant, x: e.clientX, y: e.clientY })
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative group">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                      <MapPin className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <div className="w-0.5 h-2 bg-primary" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                    <div className="bg-card border rounded-lg shadow-lg p-2.5 text-xs w-36">
                      <p className="font-semibold truncate">{plant.name}</p>
                      {plant.species && <p className="text-muted-foreground italic truncate">{plant.species}</p>}
                      <Badge variant="outline" className="mt-1 capitalize text-[10px]">{plant.type}</Badge>
                      <p className="text-primary text-[10px] mt-1">Click to edit →</p>
                    </div>
                  </div>
                  {/* Click to edit link */}
                  <Link
                    to={`/plants/${plant.id}`}
                    className="absolute inset-0"
                    onClick={(e) => { if (placingPlantId) e.preventDefault() }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={mapRef}
            className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground"
          >
            <Upload className="h-12 w-12" />
            <div className="text-center">
              <p className="font-medium">No map image uploaded</p>
              <p className="text-sm">Upload a photo of your property to start placing plants</p>
            </div>
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload Map Image
            </Button>
          </div>
        )}
      </div>

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-card border rounded-lg shadow-lg py-1 text-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex items-center gap-2 px-4 py-2 w-full hover:bg-accent text-left text-destructive"
            onClick={() => { void handleUnpin(contextMenu.plant) }}
          >
            <X className="h-4 w-4" />
            Remove from map
          </button>
          <Link
            to={`/plants/${contextMenu.plant.id}`}
            className="flex items-center gap-2 px-4 py-2 w-full hover:bg-accent"
            onClick={() => setContextMenu(null)}
          >
            Edit plant
          </Link>
        </div>
      )}

      {/* Close context menu on outside click */}
      {contextMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
      )}
    </div>
  )
}
