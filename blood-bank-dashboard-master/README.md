# Blood Bank Dashboard

## About

Blood Bank Dashboard is a modern web application built with React, Vite, TypeScript, and Tailwind CSS. It provides an interactive interface for managing blood bank inventory, donor records, and appointments. The dashboard is designed for ease of use, real-time updates, and seamless integration with Google Sheets for data storage.

## Features

- **Dashboard Overview**: View key metrics such as total donors, confirmed appointments, and available blood units.
- **Donor Management**: Track donor records, appointment statuses, and donation types.
- **Inventory Editor**: Manage and update blood, plasma, and platelet inventory.
- **Google Sheets Integration**: Fetches and updates data directly from Google Sheets.
- **Responsive UI**: Built with shadcn/ui and Radix UI for a clean, accessible design.

## How It Works

1. **Data Fetching**: The app uses custom React hooks to fetch donor and inventory data from Google Sheets in CSV format.
2. **Dashboard Display**: Metrics and tables are rendered using reusable components, providing a snapshot of current operations.
3. **Inventory Management**: Users can edit inventory levels directly from the dashboard.
4. **Real-Time Updates**: The dashboard header displays the last updated time and allows manual refreshes.
5. **Error Handling**: If data cannot be fetched, the app falls back to demo data and displays a warning.

## Getting Started

1. **Install dependencies**:
	```
	npm install
	```
2. **Run the development server**:
	```
	npm run dev
	```
3. **Build for production**:
	```
	npm run build
	```

## Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Google Sheets API
