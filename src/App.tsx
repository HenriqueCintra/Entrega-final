import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { AudioManager } from './components/AudioManager';
import { HomePage } from './pages/Home';
import { VehicleSelectionPage } from './pages/escolherVeiculo';
import { RoutesPage } from './pages/RoutesPage/RoutesPage';
import { FuelPage } from './pages/fuel/FuelPage';
import { MapComponent } from './pages/mapaRota/MapComponent';
import { GameScene } from './pages/Game-truck/game';
import { LoginPage } from './pages/auth/LoginPage';
import { ApresentacaoDesafioPage } from './pages/Desafio/ApresentacaoDesafio';
import './App.css';

function App() {
  return (
    <AudioProvider>
      <AuthProvider>
        <BrowserRouter>
          <AudioManager />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/desafios" element={<ApresentacaoDesafioPage />} />
            <Route path="/select-vehicle" element={<VehicleSelectionPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/fuel" element={<FuelPage />} />
            <Route path="/map" element={<MapComponent />} />
            <Route path="/mapa-rota" element={<MapComponent />} />
            <Route path="/game" element={<GameScene />} />
            {/* Redirecionar para a página inicial por padrão */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AudioProvider>
  );
}
/*commit*/

export default App;
