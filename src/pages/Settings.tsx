import { useEffect, useRef, useState } from 'react'
import { Download, Upload, Trash2 } from 'lucide-react'
import { getSettings, saveSettings, exportAllData, importAllData } from '@/data/db'
import type { Settings } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ConfirmDialog'

const USDA_ZONES = [
  '1a','1b','2a','2b','3a','3b','4a','4b','5a','5b',
  '6a','6b','7a','7b','8a','8b','9a','9b','10a','10b',
  '11a','11b','12a','12b','13a','13b',
]

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ growingZone: '', propertyName: 'My Garden' })
  const [saved, setSaved] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void getSettings().then(setSettings)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = async () => {
    const data = await exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `garden-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string)
        await importAllData(data)
        const s = await getSettings()
        setSettings(s)
        alert('Data imported successfully. Reload the page to see all changes.')
      } catch {
        alert('Failed to import: invalid file format.')
      }
    }
    reader.readAsText(file)
    if (importRef.current) importRef.current.value = ''
  }

  const handleMapClear = async () => {
    const updated = { ...settings, mapImage: undefined }
    await saveSettings(updated)
    setSettings(updated)
  }

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const updated = { ...settings, mapImage: reader.result as string }
      await saveSettings(updated)
      setSettings(updated)
    }
    reader.readAsDataURL(file)
  }

  const mapRef = useRef<HTMLInputElement>(null)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Garden Info */}
      <form onSubmit={(e) => { void handleSave(e) }} className="space-y-5">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Garden Info</h2>

          <div className="space-y-1.5">
            <Label htmlFor="propertyName">Property Name</Label>
            <Input
              id="propertyName"
              value={settings.propertyName}
              onChange={(e) => setSettings({ ...settings, propertyName: e.target.value })}
              placeholder="My Garden"
            />
          </div>

          <div className="space-y-1.5">
            <Label>USDA Hardiness Zone</Label>
            <Select
              value={settings.growingZone}
              onValueChange={(v) => setSettings({ ...settings, growingZone: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your zone…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not set</SelectItem>
                {USDA_ZONES.map((z) => (
                  <SelectItem key={z} value={z}>Zone {z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Your USDA hardiness zone helps determine which plants will thrive year-round.
            </p>
          </div>

          <Button type="submit" className="w-full">
            {saved ? '✓ Saved!' : 'Save Settings'}
          </Button>
        </div>
      </form>

      {/* Map Image */}
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Property Map</h2>
        {settings.mapImage ? (
          <div className="space-y-3">
            <img src={settings.mapImage} alt="Property map" className="w-full rounded-lg border max-h-48 object-cover" />
            <div className="flex gap-2">
              <input ref={mapRef} type="file" accept="image/*" className="hidden" onChange={handleMapUpload} />
              <Button variant="outline" size="sm" onClick={() => mapRef.current?.click()}>
                <Upload className="h-4 w-4" /> Replace Image
              </Button>
              <ConfirmDialog
                trigger={
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                }
                title="Remove map image?"
                description="This will clear your property map. Plant pin positions will be preserved."
                confirmLabel="Remove"
                onConfirm={() => { void handleMapClear() }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">No map image uploaded. You can also upload from the Map page.</p>
            <input ref={mapRef} type="file" accept="image/*" className="hidden" onChange={handleMapUpload} />
            <Button variant="outline" onClick={() => mapRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Map Image
            </Button>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Data Management</h2>
        <p className="text-sm text-muted-foreground">
          All data is stored locally in your browser. Export regularly to keep a backup.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1" onClick={() => { void handleExport() }}>
            <Download className="h-4 w-4" /> Export All Data
          </Button>
          <div className="flex-1">
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <ConfirmDialog
              trigger={
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4" /> Import Data
                </Button>
              }
              title="Import data?"
              description="This will replace ALL existing data (plants, events, tasks, settings) with the imported file. This cannot be undone. Make sure to export a backup first."
              confirmLabel="Replace & Import"
              onConfirm={() => importRef.current?.click()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
