import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Map as MapIcon, Leaf, CalendarDays, CheckSquare, AlertTriangle, ArrowRight } from 'lucide-react'
import { getAllTasks, getAllEvents, getAllPlants, getSettings } from '@/data/db'
import type { Task, GardenEvent, Plant, Settings } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const today = new Date().toISOString().split('T')[0]

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function isOverdue(task: Task) {
  return !task.completed && task.dueDate && task.dueDate < today
}

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<GardenEvent[]>([])
  const [plants, setPlants] = useState<Plant[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      const [ts, evts, ps, s] = await Promise.all([getAllTasks(), getAllEvents(), getAllPlants(), getSettings()])
      setTasks(ts)
      setEvents(evts.sort((a, b) => b.date.localeCompare(a.date)))
      setPlants(ps)
      setSettings(s)
      setLoading(false)
    })()
  }, [])

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading…</div>

  const plantMap = plants.reduce<Record<string, Plant>>((acc, p) => { acc[p.id] = p; return acc }, {})
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const upcomingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const aOver = isOverdue(a) ? 0 : 1
      const bOver = isOverdue(b) ? 0 : 1
      if (aOver !== bOver) return aOver - bOver
      return a.dueDate.localeCompare(b.dueDate)
    })
    .slice(0, 5)

  const recentEvents = events.slice(0, 5)

  const typeCounts: Record<string, number> = {}
  plants.forEach((p) => { typeCounts[p.type] = (typeCounts[p.type] ?? 0) + 1 })
  const pinnedCount = plants.filter((p) => p.mapX !== undefined && p.mapY !== undefined).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {settings?.propertyName || 'Garden Assistant'}
        </h1>
        <p className="text-muted-foreground text-sm">{dateStr}</p>
        {settings?.growingZone && (
          <p className="text-xs text-muted-foreground mt-0.5">USDA Zone {settings.growingZone}</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Add Plant', to: '/plants/new', icon: Leaf },
          { label: 'Log Event', to: '/events/new', icon: CalendarDays },
          { label: 'Add Task', to: '/tasks/new', icon: CheckSquare },
          { label: 'Open Map', to: '/map', icon: MapIcon },
        ].map(({ label, to, icon: Icon }) => (
          <Button key={to} asChild variant="outline" className="h-16 flex-col gap-1 text-xs">
            <Link to={to}>
              <Icon className="h-5 w-5 text-primary" />
              {label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Tasks</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/tasks">View all <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming tasks</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2">
                    {isOverdue(task) ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className={`text-xs ${isOverdue(task) ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {isOverdue(task) ? 'Overdue: ' : 'Due: '}{formatDate(task.dueDate)}
                      </p>
                      {task.plantIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.plantIds.slice(0, 2).map((pid) => (
                            <Badge key={pid} variant="secondary" className="text-[10px] py-0">
                              {plantMap[pid]?.name ?? 'Unknown'}
                            </Badge>
                          ))}
                          {task.plantIds.length > 2 && (
                            <Badge variant="secondary" className="text-[10px] py-0">+{task.plantIds.length - 2}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="w-full mt-4">
              <Link to="/tasks/new"><Plus className="h-3.5 w-3.5" /> Add Task</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/events">View all <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No events logged yet</p>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="text-xs text-muted-foreground font-medium w-20 shrink-0 pt-0.5">{formatDate(event.date)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      {event.plantIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {event.plantIds.slice(0, 2).map((pid) => (
                            <Badge key={pid} variant="secondary" className="text-[10px] py-0">
                              {plantMap[pid]?.name ?? 'Unknown'}
                            </Badge>
                          ))}
                          {event.plantIds.length > 2 && (
                            <Badge variant="secondary" className="text-[10px] py-0">+{event.plantIds.length - 2}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="w-full mt-4">
              <Link to="/events/new"><Plus className="h-3.5 w-3.5" /> Log Event</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Garden Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Garden Summary</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link to="/map">View map <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{plants.length}</p>
              <p className="text-xs text-muted-foreground">Total plants</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{pinnedCount}</p>
              <p className="text-xs text-muted-foreground">On map</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{tasks.filter((t) => !t.completed).length}</p>
              <p className="text-xs text-muted-foreground">Pending tasks</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{events.length}</p>
              <p className="text-xs text-muted-foreground">Events logged</p>
            </div>
          </div>
          {Object.keys(typeCounts).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {Object.entries(typeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <Badge key={type} variant="secondary" className="capitalize">
                    {count} {type}{count !== 1 ? 's' : ''}
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
