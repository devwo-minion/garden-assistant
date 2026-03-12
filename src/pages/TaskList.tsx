import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, CheckSquare, AlertTriangle } from 'lucide-react'
import { getAllTasks, deleteTask, saveTask, getAllPlants } from '@/data/db'
import type { Task, Plant } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { cn } from '@/lib/utils'

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

function monthKey(dateStr: string) {
  if (!dateStr) return 'No date'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
}

const today = new Date().toISOString().split('T')[0]

function isOverdue(task: Task) {
  return !task.completed && task.dueDate && task.dueDate < today
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [plantMap, setPlantMap] = useState<Map<string, Plant>>(new Map())
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [ts, plants] = await Promise.all([getAllTasks(), getAllPlants()])
    setTasks(ts)
    setPlantMap(new Map(plants.map((p) => [p.id, p])))
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const handleDelete = async (id: string) => {
    await deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const toggleComplete = async (task: Task) => {
    const updated = await saveTask({ ...task, completed: !task.completed })
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading tasks…</div>

  const overdue = tasks.filter(isOverdue).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const upcoming = tasks.filter((t) => !isOverdue(t))

  // Group upcoming by month
  const monthGroups = new Map<string, Task[]>()
  upcoming
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return a.dueDate.localeCompare(b.dueDate)
    })
    .forEach((task) => {
      const key = task.completed ? 'Completed' : monthKey(task.dueDate)
      if (!monthGroups.has(key)) monthGroups.set(key, [])
      monthGroups.get(key)!.push(task)
    })

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className={cn('transition-shadow hover:shadow-md', task.completed && 'opacity-60')}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => { void toggleComplete(task) }}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className={cn('font-medium text-sm', task.completed && 'line-through text-muted-foreground')}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {isOverdue(task) && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                  <Link to={`/tasks/${task.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <span className="text-xs">✕</span>
                    </Button>
                  }
                  title="Delete task?"
                  description={`Delete "${task.title}"? This cannot be undone.`}
                  onConfirm={() => { void handleDelete(task.id) }}
                />
              </div>
            </div>
            {task.dueDate && (
              <p className={cn('text-xs', isOverdue(task) ? 'text-amber-600 font-medium' : 'text-muted-foreground')}>
                {isOverdue(task) ? '⚠ Overdue: ' : 'Due: '}{formatDate(task.dueDate)}
              </p>
            )}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
            )}
            {task.plantIds.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {task.plantIds.map((pid) => {
                  const plant = plantMap.get(pid)
                  return (
                    <Badge key={pid} variant="secondary" className="text-xs">
                      {plant?.name ?? 'Unknown plant'}
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tasks.filter((t) => !t.completed).length} pending · {tasks.filter((t) => t.completed).length} completed
          </p>
        </div>
        <Button asChild>
          <Link to="/tasks/new">
            <Plus className="h-4 w-4" />
            Add Task
          </Link>
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-12 w-12" />}
          title="No tasks yet"
          description="Plan your garden work — planting, pruning, fertilizing, mulching."
          action={
            <Button asChild>
              <Link to="/tasks/new"><Plus className="h-4 w-4" /> Add First Task</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Overdue */}
          {overdue.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Overdue
              </h2>
              <div className="space-y-2">
                {overdue.map((task) => <TaskCard key={task.id} task={task} />)}
              </div>
            </section>
          )}

          {/* Upcoming grouped by month */}
          {Array.from(monthGroups.entries()).map(([month, monthTasks]) => (
            <section key={month}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{month}</h2>
              <div className="space-y-2">
                {monthTasks.map((task) => <TaskCard key={task.id} task={task} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
