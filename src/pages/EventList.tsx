import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, CalendarDays } from 'lucide-react'
import { getAllEvents, deleteEvent, getAllPlants } from '@/data/db'
import type { GardenEvent, Plant } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export function EventList() {
  const [events, setEvents] = useState<GardenEvent[]>([])
  const [plantMap, setPlantMap] = useState<Map<string, Plant>>(new Map())
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [evts, plants] = await Promise.all([getAllEvents(), getAllPlants()])
    evts.sort((a, b) => b.date.localeCompare(a.date))
    setEvents(evts)
    setPlantMap(new Map(plants.map((p) => [p.id, p])))
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const handleDelete = async (id: string) => {
    await deleteEvent(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading events…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Log</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <Button asChild>
          <Link to="/events/new">
            <Plus className="h-4 w-4" />
            Log Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="No events logged yet"
          description="Record your garden activities — pruning, planting, harvesting, observations."
          action={
            <Button asChild>
              <Link to="/events/new"><Plus className="h-4 w-4" /> Log First Event</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">{formatDate(event.date)}</p>
                    <CardTitle className="text-base mt-0.5">{event.title}</CardTitle>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/events/${event.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
                          Delete
                        </Button>
                      }
                      title="Delete event?"
                      description={`Delete "${event.title}"? This cannot be undone.`}
                      onConfirm={() => { void handleDelete(event.id) }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}
                {event.plantIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {event.plantIds.map((pid) => {
                      const plant = plantMap.get(pid)
                      return (
                        <Badge key={pid} variant="secondary" className="text-xs">
                          {plant?.name ?? 'Unknown plant'}
                        </Badge>
                      )
                    })}
                  </div>
                )}
                {event.photos.length > 0 && (
                  <div className="flex gap-2">
                    {event.photos.slice(0, 4).map((src, i) => (
                      <img key={i} src={src} alt="" className="h-16 w-16 object-cover rounded-md border" />
                    ))}
                    {event.photos.length > 4 && (
                      <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        +{event.photos.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
