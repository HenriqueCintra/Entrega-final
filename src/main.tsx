import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HomePage } from "./pages/Home/HomePage";
import { VehicleSelectionPage } from './pages/escolherVeiculo';
import { Login } from "./pages/auth/Login/Login";
import { Cadastro } from "./pages/auth/Cadastro/Cadastro";
import { ForgotPassword } from "./pages/auth/ForgotPassword/ForgotPassword";
import { ChangePassword } from "./pages/Perfil/ChangePassword";
import { TutorialPage } from "./pages/Tutorial/TutorialPage";
import { PerfilPage } from "./pages/Perfil/PerfilPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { EditarPerfilPage } from "./pages/Perfil/EditarPerfil";
import { ExcluirEquipePage } from "./pages/Perfil/ExcluirEquipe";
import { MapComponent } from "./pages/mapaRota/MapComponent";
import { EditarEquipePage } from "./pages/Perfil/EditarEquipe";
import { EntrarEquipePage } from "./pages/Perfil/EntrarEquipe";
import { CriarEquipePage } from "./pages/Perfil/CriarEquipe";
import { createRoot } from "react-dom/client";
import GameSelectionPage from "./pages/GameSelection/GameSelectionPage";
import { ApresentacaoDesafioPage } from "./pages/Desafio/ApresentacaoDesafio";
import { RankingPage } from "./pages/Ranking/RankingPage";
import { ChooseTeam } from "./pages/ChooseTeam/ChooseTeam";
import { GameScene } from "./pages/Game-truck/game";
import { FuelPage } from "./pages/fuel/FuelPage";
import { RoutesPage } from "./pages/RoutesPage/RoutesPage";

import { PauseMenu } from "./pages/PauseMenu/PauseMenu.tsx";


// Criar instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/select-vehicle" element={<HomePage />} />
            <Route path="/mapa-rota" element={<MapComponent />} /> */}

            <Route path="/game" element={<GameScene />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<ForgotPassword />} />
            <Route path="/tutorial" element={<TutorialPage />} />

            {/* Rotas protegidas */}

            <Route path="/perfil" element={
              <ProtectedRoute>
                <PerfilPage />
              </ProtectedRoute>
            } />
            <Route path="/perfil/editar" element={
              <ProtectedRoute>
                <EditarPerfilPage />
              </ProtectedRoute>
            } />
            <Route path="/perfil/excluir-equipe" element={
              <ProtectedRoute>
                <ExcluirEquipePage />
              </ProtectedRoute>
            } />
            <Route path="/perfil/editar-equipe" element={
              <ProtectedRoute>
                <EditarEquipePage />
              </ProtectedRoute>
            } />
            <Route path="/perfil/entrar-equipe" element={
              <ProtectedRoute>
                <EntrarEquipePage />
              </ProtectedRoute>
            } />
            <Route path="/mudar-senha" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />
            <Route path="/ranking" element={
              <ProtectedRoute>
                <RankingPage />
              </ProtectedRoute>
            } />
            <Route path="/game" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/games" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/select-vehicle" element={
              <ProtectedRoute>
                <VehicleSelectionPage />
              </ProtectedRoute>
            } />
            <Route path="/mapa-rota" element={
              <ProtectedRoute>
                <MapComponent />
              </ProtectedRoute>
            } />
            <Route path="/mapa" element={
              <ProtectedRoute>
                <MapComponent />
              </ProtectedRoute>
            } />
            <Route path="/choose-team" element={
              <ProtectedRoute>
                <ChooseTeam />
              </ProtectedRoute>
            } />
            <Route path="/create-team" element={
              <ProtectedRoute>
                <CriarEquipePage />
              </ProtectedRoute>
            } />
            <Route path="/join-team" element={
              <ProtectedRoute>
                <EntrarEquipePage />
              </ProtectedRoute>
            } />
            <Route path="/desafio" element={
              <ProtectedRoute>
                <ApresentacaoDesafioPage />
              </ProtectedRoute>
            } />
            <Route path="/game-selection" element={
              <ProtectedRoute>
                <GameSelectionPage />
              </ProtectedRoute>
            } />

            {/* Rota para o PauseMenu para testes */}
            <Route path="/pause-menu" element={
              <ProtectedRoute>
                <PauseMenu
                  isVisible={true}
                  onResume={() => console.log('Resume')}
                  onGoToProfile={() => console.log('Go to Profile')}
                  onRestart={() => console.log('Restart')}
                />
              </ProtectedRoute>
            } />

            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/fuel" element={<FuelPage />} />
            <Route path="/map" element={<MapComponent />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);
