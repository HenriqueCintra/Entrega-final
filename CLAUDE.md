# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jogos Logísticos (IFBA Juazeiro)** is a logistics-themed educational game application built with React, TypeScript, and Vite. The application features a truck driving game where players complete delivery challenges across Brazilian cities (Salvador, Recife, Fortaleza) while managing fuel, handling events, and answering quizzes.

## Development Commands

### Local Development (Non-Docker)
```bash
npm run dev           # Start development server on port 5173
npm run build         # Type-check with tsc and build for production
npm run lint          # Run ESLint
npm run preview       # Preview production build
```

### Docker Development (Recommended)
```bash
docker-compose up          # Start development server
docker-compose up -d       # Run in background
docker-compose down        # Stop and remove containers
docker-compose logs -f     # View logs
docker-compose exec frontend sh  # Access container shell
```

The application runs on `http://localhost:5173` and hot-reloads automatically during development.

## Architecture Overview

### Core Technology Stack
- **React 19** with TypeScript and React Router DOM for routing
- **Vite** as build tool with path aliases (`@/` → `./src`)
- **TanStack Query (React Query)** for server state management
- **Axios** for HTTP requests with interceptors
- **Kaboom.js** for 2D game rendering
- **Leaflet** + React Leaflet for interactive maps
- **Tailwind CSS** + shadcn/ui components for styling
- **OSRM** (Open Source Routing Machine) proxy for route calculations

### Application Structure

#### Authentication Flow
- **AuthContext** (`src/contexts/AuthContext.tsx`) manages user authentication state
- **AuthService** (`src/api/authService.ts`) handles login, registration, password reset
- **ProtectedRoute** component wraps authenticated routes
- Tokens stored in localStorage and automatically attached via axios interceptors

#### API Integration
- **Base Configuration**: `src/api/config.ts` - Centralized axios instance with interceptors
- **Services**: `authService.ts`, `gameService.ts`, `teamService.ts`
- API base URL configured via `VITE_API_URL` environment variable (defaults to `http://localhost:8000`)
- Automatic token injection and 401/403 error handling in interceptors

#### Game Architecture
The game follows a multi-stage flow:

1. **Challenge Selection** (`src/pages/mapaRota/challengesManager.ts`)
   - Three challenges: Salvador (Easy), Recife (Medium), Fortaleza (Hard)
   - Each challenge has multiple route options with different characteristics
   - Routes stored in `src/pages/mapaRota/challenges/{city}/routesData.ts`

2. **Vehicle Selection** (`src/pages/escolherVeiculo/VehicleSelectionPage.tsx`)
   - Players choose from different truck types with varying fuel efficiency and cargo capacity

3. **Route Planning** (`src/pages/mapaRota/MapComponent.tsx`)
   - Interactive Leaflet map displays available routes
   - OSRM integration for route calculation (proxied via `/osrm` endpoint in vite.config.ts)

4. **Gameplay** (`src/pages/Game-truck/game.tsx`)
   - Kaboom.js-based 2D driving game
   - Real-time progress tracking with `distanceTravelled.current` as single source of truth
   - Event system triggers obstacles, quizzes, and fuel stops
   - Mini-map overlay shows current position
   - Pause menu for game controls

5. **Game State Management**
   - Events fetched from backend API during gameplay
   - Quiz system with time limits and scoring
   - Fuel management with refueling mini-game (`src/pages/fuel/`)
   - Weather effects (rain) that impact gameplay

#### Key State Management Patterns
- **Contexts**: `AuthContext` (user authentication), `AudioContext` (game audio)
- **React Query**: Used for API data fetching with 5-minute stale time
- **useRefs**: Critical for game state (e.g., `distanceTravelled`, `activeGameIdRef`) to avoid re-render issues during game loop

#### Routing Structure
Routes defined in `src/main.tsx`:
- Public: `/`, `/login`, `/cadastro`, `/forgot-password`, `/tutorial`
- Protected: `/perfil`, `/game-selection`, `/select-vehicle`, `/mapa-rota`, `/game`, `/ranking`
- Team management: `/choose-team`, `/create-team`, `/join-team`, `/perfil/editar-equipe`

### Important Technical Details

#### Path Aliases
The project uses `@/` as an alias for `./src` (configured in tsconfig.json and vite.config.ts)

#### OSRM Proxy
Vite proxies `/osrm` requests to `http://router.project-osrm.org` to avoid CORS issues when calculating routes

#### TypeScript Configuration
- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- React JSX transform used

#### Game Loop Considerations
- Always use refs for values that change during the game loop to avoid triggering re-renders
- `distanceTravelled.current` is the authoritative source for player progress
- Event processing uses flags (`processingEvent.ref`) to prevent duplicate triggers

#### Component Organization
- **UI Components**: `src/components/ui/` (shadcn/ui components)
- **Feature Components**: `src/components/` (reusable game components)
- **Page Components**: `src/pages/` (route-level components)
- **Types**: `src/types/` (TypeScript interfaces)
- **Constants**: `src/constants/` (game data like team configurations)

### Environment Configuration

Create `.env` file based on `.env.example`:
```
VITE_API_URL=http://localhost:8000
```

### Docker Notes
- Dockerfile uses Node.js 18-alpine image
- Hot reload enabled via CHOKIDAR_USEPOLLING in docker-compose.yml
- node_modules mounted as anonymous volume for performance
- Project recommended to run on WSL2 for Windows users

### Common Patterns

#### API Calls with React Query
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: () => api.get('/endpoint').then(res => res.data)
});
```

#### Protected Routes
Always wrap authenticated pages with `<ProtectedRoute>` component which checks `AuthContext.isAuthenticated`

#### Game Event Handling
Use mutation with React Query for game events:
```typescript
const mutation = useMutation({
  mutationFn: (data) => GameService.respondToEvent(data),
  onSuccess: () => { /* handle success */ }
});
```

### Testing the Application
- No test runner configured yet
- Manual testing via development server recommended
- Check browser console for game state logging (extensive console.log statements present)

### Git Workflow
- Main branch: `main`
- Development branch: `develop` (current branch)
- Recent commits focus on team data updates, sprite changes, and conflict resolution
