export type PlantType = 'tree' | 'shrub' | 'perennial' | 'annual' | 'groundcover' | 'vine' | 'other'

export interface Companion {
  plantId: string
  notes: string
}

export interface Plant {
  id: string
  name: string
  species: string
  type: PlantType
  datePlanted: string
  notes: string
  mapX?: number
  mapY?: number
  companions: Companion[]
  photos: string[]
}

export interface GardenEvent {
  id: string
  date: string
  title: string
  description: string
  plantIds: string[]
  photos: string[]
}

export interface Task {
  id: string
  title: string
  dueDate: string
  description: string
  plantIds: string[]
  completed: boolean
}

export interface Settings {
  growingZone: string
  propertyName: string
  mapImage?: string
}
