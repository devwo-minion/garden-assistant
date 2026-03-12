### PHASE 1: Project Structure & Data Layer

**What this does:** Sets up the folder structure, creates the database utilities for storing plants, events, and tasks in the browser, and creates the data models.

**Paste this into Claude:**

```
I'm building a Garden Assistant web app with React + Vite. The project is already initialized with react-router-dom, uuid, localforage, and lucide-react installed.

Please set up the project structure and data layer:

1. Create this folder structure inside /src:
   - /components (reusable UI components)
   - /pages (one component per page/view)
   - /data (database and data utilities)
   - /assets (for static files like the map image)

2. Create a data storage module at /src/data/db.js using localforage. It should provide simple async functions for CRUD operations (create, read, update, delete) on three collections:
   - plants
   - events
   - tasks

   Each collection should be stored as an array of objects in localforage under its own key. Provide these exported functions for each collection:
   - getAll<Collection>() — returns the full array
   - get<Collection>ById(id) — returns a single item
   - save<Collection>(item) — if item has no id, generate one with uuid. If it has an id, update the existing item. Return the saved item.
   - delete<Collection>(id) — remove by id

3. Create data model documentation in a comment block at the top of db.js showing the shape of each object:

   Plant: { id, name, species, type (tree/shrub/perennial/annual/groundcover/vine/other), datePlanted, notes, mapX (number 0-100 as percentage), mapY (number 0-100 as percentage) }

   Event: { id, date, title, description, plantIds (array of plant ids) }

   Task: { id, title, dueDate, description, plantIds (array of plant ids), completed (boolean) }

4. Set up React Router in App.jsx with these routes:
   - / → Dashboard page (placeholder for now)
   - /plants → Plant list page (placeholder)
   - /plants/new → Add plant form (placeholder)
   - /plants/:id → Edit plant form (placeholder)
   - /map → Map view (placeholder)
   - /events → Event log (placeholder)
   - /events/new → Add event (placeholder)
   - /tasks → Task list (placeholder)
   - /tasks/new → Add task (placeholder)
   - /tasks/:id → Edit task (placeholder)

5. Create a simple navigation bar component that links to Dashboard, Map, Plants, Events, and Tasks. Include it on every page.

6. Create a basic App.css with clean, modern styling:
   - Use a natural color palette (greens, earth tones, warm whites)
   - Clean sans-serif font
   - Responsive layout that works on both desktop and mobile
   - Style the navigation bar

For every placeholder page, just render the page name as a heading so I can verify routing works.

Do not use TypeScript. Use plain JavaScript with .jsx files.
```

**After Claude finishes:** Run `npm run dev`, click through every link in the navigation bar, and verify each page shows its name. If anything is broken, paste the error into Claude and ask it to fix it.

---

### PHASE 2: Plant Management

**What this does:** Builds the full plant CRUD interface — listing, adding, editing, and deleting plants.

**Paste this into Claude:**

```
Now let's build the Plant management pages. The data layer from db.js is already set up.

1. Plant List Page (/plants):
   - Fetch all plants from the database on load
   - Display them in a clean card layout or table
   - Each entry shows: name, species, type, date planted
   - Each entry has an Edit button (links to /plants/:id) and a Delete button (with a confirmation prompt)
   - An "Add New Plant" button at the top that links to /plants/new
   - If no plants exist yet, show a friendly empty state message like "No plants added yet. Start building your garden!"

2. Add Plant Form (/plants/new):
   - Form fields: Name (text), Species (text), Type (dropdown with options: Tree, Shrub, Perennial, Annual, Groundcover, Vine, Other), Date Planted (date picker), Notes (textarea)
   - Do NOT include map position fields here — those will be set on the map
   - On submit, save to the database and navigate back to /plants
   - Include a Cancel button that goes back without saving

3. Edit Plant Form (/plants/:id):
   - Same form as Add, but pre-populated with the existing plant's data
   - Load the plant by ID from the URL params
   - On submit, update in database and navigate back to /plants
   - Show a "Plant not found" message if the ID doesn't match anything

Make sure all forms have basic validation (name is required at minimum). Use clean, consistent styling that matches the existing app theme.
```

**After Claude finishes:** Test adding a few plants. Try editing one. Try deleting one. Verify the list updates correctly.

**Suggested test plants to add:**
- Peach Tree 1, Prunus persica, Tree
- Peach Tree 2, Prunus persica, Tree
- Mulberry 1, Morus alba, Tree
- Apple 1, Malus domestica, Tree
- Comfrey 1, Symphytum officinale, Perennial
- White Clover Patch, Trifolium repens, Groundcover

---

### PHASE 3: Interactive Map

**What this does:** Creates the map view where you can see your landscape image and place pin markers for each plant.

**Before this phase:** You need a map image of your property. Save it as a JPG or PNG file. You'll place it in the project manually or ask Claude to help.

**Paste this into Claude:**

```
Now let's build the interactive Map page. I will provide my own landscape image to use as the map background.

1. Map Page (/map):
   - Display my landscape image as the map background. For now, use a placeholder (a colored rectangle with text saying "Upload your map image") that I can later replace with my actual image file. The image path should be easy to find and change — put it in /src/assets/ and import it, with a comment showing where to swap the file.
   - The map should be responsive but maintain its aspect ratio
   - The map container should allow scrolling/panning if the image is larger than the viewport

2. Plant Pins on the Map:
   - For every plant that has mapX and mapY values set, display a pin marker on the map at that position
   - Pins should be visually clear — use a colored marker icon or circle
   - When I hover over or click a pin, show a tooltip or popup with the plant's name and species
   - Clicking the popup should link to that plant's edit page

3. Placing New Pins:
   - Add a "Place Plant" mode. When activated, show a dropdown to select a plant (from the database) that doesn't have map coordinates yet, or let me reposition an existing plant.
   - When in this mode, clicking on the map sets the X/Y coordinates for the selected plant and saves them to the database
   - The pin should appear immediately after placing
   - mapX and mapY should be stored as percentage values (0-100) relative to the image dimensions, so they stay accurate regardless of display size

4. Removing Pins:
   - Allow me to right-click (or long-press on mobile) a pin to get an option to remove it from the map (this clears mapX/mapY but doesn't delete the plant)

Style the map page to take up most of the screen space. The pin markers should be visually distinct and easy to tap on mobile.
```

**After Claude finishes:** Test placing pins for each of your test plants. Verify that pins appear in the correct position, that hovering shows info, and that refreshing the page keeps the pins where you put them.

**To add your real map image later:** Replace the placeholder file in `/src/assets/` with your actual landscape image. If you need help, ask Claude: "How do I replace the map placeholder image with my own file called my-property.jpg?"

---

### PHASE 4: Event Log

**What this does:** Builds the garden event journal where you record things you've done.

**Paste this into Claude:**

```
Now let's build the Event Log feature for tracking garden activities.

1. Event List Page (/events):
   - Fetch all events from the database, sorted by date (newest first)
   - Display each event as a card showing: date (formatted nicely, e.g., "11 March 2026"), title, description (truncated if long), and the names of the associated plants (looked up from the plant database by their IDs)
   - "Add New Event" button at the top
   - Each event card has Edit and Delete buttons
   - If no events exist, show a friendly empty state

2. Add Event Form (/events/new):
   - Fields: Date (date picker, default to today), Title (text input), Description (textarea for detailed notes)
   - Plant selector: Show all plants from the database as a multi-select checklist. Let me check/uncheck which plants were involved in this event. Show plant name and type for each option.
   - On submit, save with the selected plant IDs and navigate back to /events
   - Cancel button to go back without saving

3. Edit Event Page:
   - Allow editing existing events. You can either make this a separate route (/events/:id/edit) or use a modal — whatever you think provides the better user experience.
   - Pre-populate all fields including the plant checklist
   - Save and Cancel buttons

Make sure the plant names display correctly even if a plant is later deleted (show "Unknown plant" or similar for deleted references).
```

**After Claude finishes:** Add a test event like the example from the original plan: Date March 11 2026, Title "Pruning", Description "Spring pruning of stone fruit and other trees", and select Peach Tree 1, Peach Tree 2, Mulberry 1, and Apple 1.

---

### PHASE 5: Task Manager

**What this does:** Builds the task tracking system with upcoming task views.

**Paste this into Claude:**

```
Now let's build the Task Manager for planning future garden work.

1. Task List Page (/tasks):
   - Fetch all tasks from the database
   - Display tasks grouped by month and sorted by due date within each month
   - Month headers should be clearly visible (e.g., "March 2026", "April 2026")
   - Each task shows: title, due date, description (truncated), associated plant names, and a completed checkbox
   - Checking the completed box should toggle the task's completed status in the database and visually style it as done (e.g., strikethrough or muted colors)
   - Completed tasks should appear at the bottom of their month group
   - Each task has Edit and Delete buttons
   - "Add New Task" button at the top
   - If no tasks exist, show a friendly empty state

2. Add Task Form (/tasks/new):
   - Fields: Title (text), Due Date (date picker), Description (textarea)
   - Plant selector: Same multi-select checklist as the Events form — show all plants, let me select which ones this task applies to
   - On submit, save and navigate back to /tasks
   - Cancel button

3. Edit Task Page (/tasks/:id):
   - Same form as Add, pre-populated with existing data
   - Save and Cancel buttons

4. Overdue task indicator:
   - Tasks with a due date in the past that are not completed should be highlighted visually (e.g., red text or a warning icon) and grouped in an "Overdue" section at the top of the list

Make sure the plant names display correctly even if a plant is later deleted.
```

**After Claude finishes:** Add several test tasks with different dates across different months. Verify the grouping and sorting works. Mark one as complete and verify it moves to the bottom of its group.

**Suggested test tasks:**
- "Apply dormant spray to fruit trees" — Due: March 15, 2026 — Plants: Peach Tree 1, Peach Tree 2, Apple 1
- "Plant comfrey around fruit tree drip lines" — Due: April 1, 2026 — Plants: Comfrey 1
- "Fertilize fruit trees with compost" — Due: April 15, 2026 — Plants: all trees
- "Summer pruning of stone fruit" — Due: July 1, 2026 — Plants: Peach Tree 1, Peach Tree 2
- "Mulch perennial beds" — Due: April 20, 2026 — Plants: Comfrey 1, White Clover Patch

---

### PHASE 6: Dashboard

**What this does:** Creates a useful landing page that shows you what needs attention.

**Paste this into Claude:**

```
Now let's build the Dashboard page (the home page at /).

The dashboard should give me a quick overview of my garden at a glance:

1. Welcome section with a title like "Garden Assistant" and today's date

2. Upcoming Tasks panel:
   - Show the next 5 upcoming incomplete tasks sorted by due date
   - Each shows title, due date, and plant names
   - Overdue tasks should be highlighted
   - "View All Tasks" link to /tasks

3. Recent Activity panel:
   - Show the 5 most recent events sorted by date
   - Each shows date, title, and plant names
   - "View All Events" link to /events

4. Garden Summary panel:
   - Total number of plants
   - Number of plants by type (e.g., "4 Trees, 1 Perennial, 1 Groundcover")
   - Number of plants placed on the map vs. total plants
   - "View Map" link

5. Quick Actions section:
   - Buttons for the most common actions: "Add Plant", "Log Event", "Add Task", "Open Map"
   - Each links to the relevant page

Layout should be a clean grid/card layout that works on both desktop and mobile. On mobile, the panels should stack vertically.
```

**After Claude finishes:** Verify the dashboard shows your test data correctly. Check that all links work.

---

### PHASE 7: Polish & Final Touches

**Paste this into Claude:**

```
Let's do a final polish pass on the Garden Assistant app.

1. Consistent styling check:
   - Make sure all pages use consistent spacing, fonts, colors, and button styles
   - Ensure all forms have the same layout pattern
   - All delete actions should require confirmation
   - Add subtle hover effects to clickable items

2. Mobile responsiveness:
   - Test every page at mobile width (less than 500px)
   - Navigation should collapse into a hamburger menu on mobile
   - Forms should be single-column on mobile
   - Map should be usable on touch devices

3. Empty state handling:
   - Every list page should gracefully handle having no data

4. Loading states:
   - Since we use async localforage, add simple loading indicators while data is being fetched

5. Add a way to export/import all data as a JSON file:
   - In the navigation, add a Settings or Data Management option
   - "Export Data" button that downloads all plants, events, and tasks as a single JSON file
   - "Import Data" button that lets me upload a JSON file to restore data
   - Warn before importing that it will replace existing data

6. Add the ability to upload my property map image directly through the app:
   - On the Map page, if no map image is set, show an upload area
   - Let me select a JPG or PNG from my computer
   - Store the image using localforage (as a base64 string or blob)
   - Use this stored image as the map background going forward

Review all the code for any bugs, console errors, or broken functionality. Fix anything you find.
```
