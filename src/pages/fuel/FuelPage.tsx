import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FUEL_PRICES: Record<string, number> = {
  DIESEL: 6.89,
  GASOLINA: 7.29,
  ALCOOL: 5.99,
};

export const FuelPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const receivedVehicle = location.state?.selectedVehicle || location.state?.vehicle || {
    id: 'carreta',
    name: 'Carreta',
    consumption: { asphalt: 2, dirt: 1.5 },
    image: '/carreta.png',
    maxCapacity: 495,
    currentFuel: 0,
    fuelType: 'Diesel',
  };
  const initialMoney: number = location.state?.availableMoney ?? 5500;
  const [playerBalance, setPlayerBalance] = useState<number>(initialMoney);
  const vehicle = receivedVehicle as typeof receivedVehicle;
  const selectedRoute = location.state?.selectedRoute;

  const [selectedFuel, setSelectedFuel] = useState<string>('DIESEL');
  const [selectedAmount, setSelectedAmount] = useState<string>('1/4 TANQUE');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const WRONG_FUEL_PENALTY = 500.0;
  const vehicleFuelType = vehicle?.fuelType || 'Diesel';

  const calculateCost = () => {
    if (!vehicle) return 0;

    let liters = 0;
    switch (selectedAmount) {
      case '1/4 TANQUE':
        liters = vehicle.maxCapacity * 0.25;
        break;
      case '1/2 TANQUE':
        liters = vehicle.maxCapacity * 0.5;
        break;
      case 'TANQUE CHEIO':
        liters = vehicle.maxCapacity;
        break;
    }

    return FUEL_PRICES[selectedFuel] * liters;
  };

  const totalCost = calculateCost();
  const finalBalance = playerBalance - totalCost;

  const handleRefuel = () => {
    if (!vehicle || totalCost <= 0) return;

    const selectedFuelNormalized =
      selectedFuel === 'DIESEL'
        ? 'Diesel'
        : selectedFuel === 'GASOLINA'
        ? 'Gasolina'
        : 'Alcool';

    if (selectedFuelNormalized !== vehicleFuelType) {
      setPlayerBalance(playerBalance - WRONG_FUEL_PENALTY);
      setShowPenaltyModal(true);
      return;
    }

    let fraction = 0.25;
    switch (selectedAmount) {
      case '1/2 TANQUE':
        fraction = 0.5;
        break;
      case 'TANQUE CHEIO':
        fraction = 1.0;
        break;
    }

    const refuelInfo = {
      fuelType: selectedFuelNormalized,
      fraction: fraction,
      cost: totalCost,
      liters: vehicle ? vehicle.maxCapacity * fraction : 0,
    };

    navigate('/fuel-minigame', { state: { refuelInfo, selectedVehicle: vehicle, availableMoney: playerBalance, selectedRoute } });
  };

  const handleSkip = () => {
    navigate('/game', { state: { selectedVehicle: vehicle, availableMoney: playerBalance, selectedRoute } });
  };

  if (!vehicle) return null;

  const fuelPercentage = (vehicle.currentFuel / vehicle.maxCapacity) * 100;
  const getVehicleImageUrl = (vehicleImage: string) => {
    if (!vehicleImage) return '/assets/truck.png';
    if (vehicleImage.startsWith('/assets/')) return vehicleImage;
    if (vehicleImage.startsWith('/src/assets/')) {
      const fileName = vehicleImage.replace('/src/assets/', '');
      return `/assets/${fileName}`;
    }
    // fallback: mantém caminho relativo ao public
    return vehicleImage;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 font-['Press_Start_2P'] text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 border-b-4 border-cyan-400 p-6 flex justify-between items-center">
        <h1 className="text-lg text-white font-bold tracking-wider">TELA DE ABASTECIMENTO</h1>
        <div className="text-right text-sm text-white">
          <div className="mb-1">
            R$ {playerBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs">SALDO FINAL: R$ {finalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Panel */}
        <div className="w-1/2 bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400 border-r-4 border-slate-800 p-6 flex flex-col justify-start">
          {/* Voltar */}
          <button
            onClick={() => navigate('/routes')}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 border-2 border-slate-800 font-bold mb-4 text-sm self-start rounded shadow-lg"
          >
            ← VOLTAR
          </button>

          {/* Vehicle Name */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 border-4 border-slate-800 inline-block mb-6 font-bold text-lg self-start rounded shadow-lg">
            {vehicle.name.toUpperCase()}
          </div>

          {/* Vehicle Stats */}
          <div className="bg-gradient-to-br from-slate-200 to-blue-200 border-4 border-slate-800 p-5 mb-5 text-sm rounded shadow-lg">
            <div className="grid grid-cols-2 gap-5 mb-5 text-black">
              <div className="text-center">
                <div className="font-bold text-base mb-2">CONSUMO</div>
                <div className="text-xl font-bold">{vehicle.consumption.asphalt} KM/L</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-base mb-2">TANQUE</div>
                <div className="text-xl font-bold">{vehicle.currentFuel}L / {vehicle.maxCapacity}L</div>
              </div>
            </div>

            {/* Fuel Bar */}
            <div className="text-black mb-3 font-bold text-sm text-center">NÍVEL DO TANQUE</div>
            <div className="w-full bg-slate-300 border-4 border-slate-800 h-8 relative overflow-hidden rounded shadow-inner">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-full transition-all duration-300 rounded-l" style={{ width: `${fuelPercentage}%` }} />
              <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-sm">{fuelPercentage.toFixed(1)}%</div>
            </div>
          </div>

          {/* Vehicle Image */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-96 h-64 bg-gradient-to-br from-slate-300 to-blue-300 border-4 border-slate-800 flex items-center justify-center p-2 rounded shadow-xl">
              <img src={getVehicleImageUrl(vehicle.image)} alt="Veículo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black px-6 py-3 border-4 border-slate-800 font-bold text-sm rounded shadow-lg transition-all hover:scale-105"
          >
            PULAR ABASTECIMENTO
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 bg-gradient-to-br from-indigo-400 via-blue-400 to-cyan-400 p-6 flex flex-col justify-start">
          {/* Posto Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 border-4 border-slate-800 p-3 text-center mb-4 rounded shadow-lg">
            <h3 className="text-base font-bold text-white">POSTO DE COMBUSTÍVEL</h3>
          </div>

          {/* Fuel Type */}
          <div className="mb-6">
            <h4 className="text-black font-bold mb-3 text-xs bg-gradient-to-r from-orange-300 to-yellow-300 border-4 border-slate-800 p-2 inline-block rounded shadow-lg">ESCOLHA O COMBUSTÍVEL:</h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['DIESEL', 'GASOLINA', 'ALCOOL'].map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => setSelectedFuel(fuel)}
                  className={`px-4 py-3 border-4 border-slate-800 font-bold transition-all text-sm rounded shadow-lg hover:scale-105 ${
                    selectedFuel === fuel
                      ? fuel === 'DIESEL'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105'
                        : fuel === 'GASOLINA'
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black scale-105'
                        : 'bg-gradient-to-r from-purple-500 to-violet-500 text-white scale-105'
                      : 'bg-gradient-to-r from-slate-300 to-gray-300 text-black hover:from-slate-400 hover:to-gray-400'
                  }`}
                >
                  {fuel}
                </button>
              ))}
            </div>

            {/* Fuel Price */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 border-4 border-slate-800 p-3 text-center rounded shadow-lg">
              <div className="text-white font-bold text-sm">
                {selectedFuel}: R$ {FUEL_PRICES[selectedFuel].toFixed(2)} / LITRO
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <h4 className="text-black font-bold mb-3 text-xs bg-gradient-to-r from-orange-300 to-yellow-300 border-4 border-slate-800 p-2 inline-block rounded shadow-lg">ESCOLHA A QUANTIDADE:</h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['1/4 TANQUE', '1/2 TANQUE', 'TANQUE CHEIO'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`px-3 py-3 border-4 border-slate-800 font-bold text-xs transition-all rounded shadow-lg hover:scale-105 ${
                    selectedAmount === amount
                      ? amount === '1/4 TANQUE'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white scale-105'
                        : amount === '1/2 TANQUE'
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black scale-105'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105'
                      : 'bg-gradient-to-r from-slate-300 to-gray-300 text-black hover:from-slate-400 hover:to-gray-400'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 border-4 border-slate-800 p-4 text-center mb-4 rounded shadow-xl">
            <div className="text-lg font-bold text-white">TOTAL: R$ {totalCost.toFixed(2)}</div>
          </div>

          {/* Refuel */}
          <button
            onClick={handleRefuel}
            disabled={totalCost > playerBalance}
            className={`w-full py-4 border-4 border-slate-800 font-bold text-base transition-all rounded shadow-xl ${
              totalCost > playerBalance
                ? 'bg-gradient-to-r from-slate-400 to-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105'
            }`}
          >
            ABASTECER AGORA
          </button>

          <div className="flex-1"></div>
        </div>
      </div>

      {/* Penalty Modal */}
      {showPenaltyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-600 to-red-700 border-4 border-slate-800 rounded-lg p-8 max-w-lg mx-4 text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <img src="/alerta.png" alt="Alerta" className="w-16 h-16 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-6 font-['Press_Start_2P']">COMBUSTÍVEL ERRADO!</h2>
            <p className="text-white mb-6 font-['Press_Start_2P'] text-sm leading-relaxed">
              Multa de R$ {WRONG_FUEL_PENALTY.toFixed(2)} aplicada por tentar usar {selectedFuel} em um veículo a {vehicleFuelType}.
            </p>
            <p className="text-yellow-300 mb-8 text-sm font-['Press_Start_2P']">Veículo compatível com: {vehicleFuelType}</p>
            <button
              onClick={() => setShowPenaltyModal(false)}
              className="bg-gradient-to-r from-white to-gray-100 text-red-600 font-bold py-3 px-6 border-4 border-slate-800 hover:from-gray-200 hover:to-gray-300 font-['Press_Start_2P'] text-sm rounded shadow-lg transition-all hover:scale-105"
            >
              ENTENDI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};