import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { PlantList } from './pages/PlantList'
import { PlantForm } from './pages/PlantForm'
import { MapView } from './pages/MapView'
import { EventList } from './pages/EventList'
import { EventForm } from './pages/EventForm'
import { TaskList } from './pages/TaskList'
import { TaskForm } from './pages/TaskForm'
import { SettingsPage } from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plants" element={<PlantList />} />
          <Route path="/plants/new" element={<PlantForm />} />
          <Route path="/plants/:id" element={<PlantForm />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/new" element={<EventForm />} />
          <Route path="/events/:id/edit" element={<EventForm />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id" element={<TaskForm />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
