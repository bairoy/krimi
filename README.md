# Krimi

Krimi is a personal productivity mobile application designed to help users manage their daily tasks, notes, calendar events, and interact with an AI-powered assistant. Built for individuals seeking efficient organization and intelligent assistance, Krimi integrates seamlessly with modern mobile workflows.

## Key Features

- **Notes Management**: Create, edit, and organize personal notes with a clean, intuitive interface.
- **Calendar Integration**: View and manage calendar events directly within the app, leveraging device calendar APIs.
- **Task Management**: Maintain to-do lists with prioritization, due dates, and completion tracking.
- **AI-Powered Chat Assistant**: Engage in conversations with an AI assistant for productivity tips, reminders, and general queries.

The app features a modern mobile UI with sidebar-based navigation for easy access to conversations and core features.

## Tech Stack

- **Frontend**: React Native with Expo for cross-platform mobile development.
- **Language**: TypeScript for type-safe development.
- **Styling**: NativeWind (Tailwind CSS for React Native) for responsive UI components.
- **Navigation**: Expo Router for file-based routing and navigation.
- **State Management**: Zustand for lightweight, scalable state handling.
- **Authentication & Database**: Supabase for user authentication, real-time data synchronization, and backend services.
- **Backend Integration**: Communicates with a FastAPI backend for AI chat functionality (external repository).

## Architecture

Krimi follows a client-server architecture:

- **Frontend (React Native/Expo)**: Handles UI rendering, user interactions, local state management, and API communication. Responsibilities include authentication flows, data presentation, and offline-capable features.
- **Backend (FastAPI)**: Processes AI chat requests, handles complex computations, and provides API endpoints for advanced features. The backend is separate from this repository and handles AI model interactions.

Data flows between the frontend and Supabase for persistent storage, while AI interactions route through the FastAPI backend.

## Project Structure

```
my-app/
├── app/                          # Expo Router pages and layouts
│   ├── (auth)/                   # Authentication-related screens
│   ├── (tabs)/                   # Main tab-based navigation
│   │   ├── AIassistant.tsx       # AI chat interface
│   │   ├── Calendar.tsx          # Calendar view
│   │   ├── Notes.tsx             # Notes management
│   │   └── Tasks.tsx             # Task management
│   ├── _layout.tsx               # Root layout
│   └── config/                   # App configuration
├── assets/                       # Static assets (icons, images)
├── components/                   # Reusable UI components
│   ├── Header.tsx
│   ├── QuoteCard.tsx
│   ├── TaskButton.tsx
│   └── TaskCard.tsx
├── constants/                    # App constants (icons, months)
├── servers/                      # Backend service configurations
│   └── config/
│       └── supabase.ts           # Supabase client setup
├── store/                        # State management (Zustand stores)
│   └── useAuthStore.ts           # Authentication state
├── types/                        # TypeScript type definitions
├── app.json                      # Expo app configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── tailwind.config.js            # NativeWind configuration
```

## Setup and Installation

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Emulator/Device

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables (see Environment Variables section).

4. Start the development server:
   ```bash
   npx expo start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_BASE_URL=your_fastapi_backend_base_url
```

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key.
- `EXPO_PUBLIC_API_BASE_URL`: Base URL for the FastAPI backend handling AI chat requests.

These variables are exposed to the client-side code via Expo's public environment variable system.

## Running the App Locally

1. Ensure all environment variables are configured.

2. Start the Expo development server:

   ```bash
   npx expo start
   ```

3. Choose your target platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator/Device
   - Press `w` for Web (limited functionality)

The app will reload automatically on code changes.

## Authentication and Data Storage

Krimi uses Supabase for authentication and data persistence:

- **Authentication**: Users sign up/login via Supabase Auth. Sessions are persisted using AsyncStorage for seamless cross-session access.
- **Data Storage**: User data (notes, tasks, chat sessions) is stored in Supabase's PostgreSQL database. Real-time subscriptions enable live updates across devices.
- **Security**: All data transmission uses HTTPS, and sensitive operations require valid authentication tokens.

The app handles authentication state globally via Zustand, ensuring consistent user session management across components.

## Development Notes

- **Code Style**: Follow TypeScript best practices with strict type checking enabled.
- **State Management**: Use Zustand for component-level state; avoid prop drilling.
- **API Calls**: Centralize backend communication in service modules under `servers/`.
- **Testing**: Implement unit tests for critical components and utilities.
- **Performance**: Optimize renders with React.memo and useCallback where appropriate.
- **Linting**: Run `npm run lint` to check code quality.

## Future Roadmap

- Enhanced AI capabilities with context-aware responses
- Offline synchronization for notes and tasks
- Integration with third-party calendar services
- Advanced task automation features
- Multi-device synchronization improvements
- Voice input for notes and tasks
