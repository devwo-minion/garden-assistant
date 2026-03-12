import localforage from 'localforage'
import { v4 as uuidv4 } from 'uuid'
import type { Plant, GardenEvent, Task, Settings } from '../types'

// ─── Plants ──────────────────────────────────────────────────────────────────

export async function getAllPlants(): Promise<Plant[]> {
  return (await localforage.getItem<Plant[]>('plants')) ?? []
}

export async function getPlantById(id: string): Promise<Plant | undefined> {
  const plants = await getAllPlants()
  return plants.find((p) => p.id === id)
}

export async function savePlant(plant: Partial<Plant> & { name: string }): Promise<Plant> {
  const plants = await getAllPlants()
  if (plant.id) {
    const idx = plants.findIndex((p) => p.id === plant.id)
    const updated = { ...plants[idx], ...plant } as Plant
    if (idx >= 0) plants[idx] = updated
    else plants.push(updated)
    await localforage.setItem('plants', plants)
    return updated
  } else {
    const newPlant: Plant = {
      species: '',
      type: 'other',
      datePlanted: '',
      notes: '',
      companions: [],
      photos: [],
      ...plant,
      id: uuidv4(),
    }
    plants.push(newPlant)
    await localforage.setItem('plants', plants)
    return newPlant
  }
}

export async function deletePlant(id: string): Promise<void> {
  const plants = await getAllPlants()
  await localforage.setItem('plants', plants.filter((p) => p.id !== id))
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getAllEvents(): Promise<GardenEvent[]> {
  return (await localforage.getItem<GardenEvent[]>('events')) ?? []
}

export async function getEventById(id: string): Promise<GardenEvent | undefined> {
  const events = await getAllEvents()
  return events.find((e) => e.id === id)
}

export async function saveEvent(event: Partial<GardenEvent> & { title: string }): Promise<GardenEvent> {
  const events = await getAllEvents()
  if (event.id) {
    const idx = events.findIndex((e) => e.id === event.id)
    const updated = { ...events[idx], ...event } as GardenEvent
    if (idx >= 0) events[idx] = updated
    else events.push(updated)
    await localforage.setItem('events', events)
    return updated
  } else {
    const newEvent: GardenEvent = {
      date: '',
      description: '',
      plantIds: [],
      photos: [],
      ...event,
      id: uuidv4(),
    }
    events.push(newEvent)
    await localforage.setItem('events', events)
    return newEvent
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const events = await getAllEvents()
  await localforage.setItem('events', events.filter((e) => e.id !== id))
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getAllTasks(): Promise<Task[]> {
  return (await localforage.getItem<Task[]>('tasks')) ?? []
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const tasks = await getAllTasks()
  return tasks.find((t) => t.id === id)
}

export async function saveTask(task: Partial<Task> & { title: string }): Promise<Task> {
  const tasks = await getAllTasks()
  if (task.id) {
    const idx = tasks.findIndex((t) => t.id === task.id)
    const updated = { ...tasks[idx], ...task } as Task
    if (idx >= 0) tasks[idx] = updated
    else tasks.push(updated)
    await localforage.setItem('tasks', tasks)
    return updated
  } else {
    const newTask: Task = {
      dueDate: '',
      description: '',
      plantIds: [],
      completed: false,
      ...task,
      id: uuidv4(),
    }
    tasks.push(newTask)
    await localforage.setItem('tasks', tasks)
    return newTask
  }
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getAllTasks()
  await localforage.setItem('tasks', tasks.filter((t) => t.id !== id))
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = { growingZone: '', propertyName: 'My Garden' }

export async function getSettings(): Promise<Settings> {
  return (await localforage.getItem<Settings>('settings')) ?? DEFAULT_SETTINGS
}

export async function saveSettings(settings: Settings): Promise<void> {
  await localforage.setItem('settings', settings)
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export async function exportAllData() {
  const [plants, events, tasks, settings] = await Promise.all([
    getAllPlants(),
    getAllEvents(),
    getAllTasks(),
    getSettings(),
  ])
  return { plants, events, tasks, settings }
}

export async function importAllData(data: { plants: Plant[]; events: GardenEvent[]; tasks: Task[]; settings: Settings }) {
  await Promise.all([
    localforage.setItem('plants', data.plants),
    localforage.setItem('events', data.events),
    localforage.setItem('tasks', data.tasks),
    localforage.setItem('settings', data.settings),
  ])
}
