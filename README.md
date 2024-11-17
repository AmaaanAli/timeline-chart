## Dashboard Timeline Visualization

**A responsive and interactive dashboard visualization tool built with React, Material-UI, and VIS Timeline, designed to display schedules, layers, and events in a visually appealing and user-friendly format.**

## Features
    -Dynamic Timeline: Visualize events and schedules with zoomable and scrollable timelines.
    -Event Grouping: Automatically merges overlapping events for better readability.

## User-friendly Controls:
    -Navigate through different time ranges (e.g., 1 Day, 1 Week, 1 Month).
    -Quickly jump to "Today" with a single click.
    -Intuitive forward/backward navigation with animations.
    -Responsive Design: Optimized for all screen sizes, including mobile, tablet, and desktop.
    -Custom Styling: Layered and color-coded events for clarity.

## Technologies Used
    -React: Core library for building the user interface.
    -Material-UI (MUI): For UI components and responsive design.
    -VIS Timeline: For rendering and managing interactive timelines.
    -Moment.js: For handling dates and formatting.
    -JavaScript: Core logic and functionality.

## Installation

**Clone the repository & Install dependencies**
    -npm install
    -Start the development server
    -npm start
    -npm run dev

## Usage
    -Add or customize the scheduleData in the utils/data.js file to include your desired events and layers.
    -Customize the userEnums and controlsDays in the utils/enums.js file to define user-specific details and time ranges.

## Folder Structure
src/
├── components/
│   ├── Dashboard.jsx   # Main dashboard component
├── utils/
│   ├── data.js         # Mock schedule data
│   ├── enums.js        # Enum values for users and time ranges
├── styles/
│   ├── vis-timeline.css # Timeline styles

## Key Functions
    -mergeEvents(events): Groups and handles overlapping events.
    -prepareTimelineData(data): Prepares events and layers for VIS Timeline rendering.
    -initializeTimeline(data): Sets up the timeline instance.
    -handleTodayClick(): Focuses the timeline view on today's date.

## Acknowledgements
    -VIS Timeline Documentation
    -Material-UI