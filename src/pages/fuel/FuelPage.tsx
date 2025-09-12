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
    <div className="min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] font-['Press_Start_2P'] text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 relative z-10">
        {}
        <button
          onClick={() => navigate('/routes')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 border border-black rounded-md shadow-md font-['Silkscreen'] h-10"
        >
          ← Voltar
        </button>
        
        {/* Título centralizado */}
        <h1 className="text-lg text-white font-bold tracking-wider font-['Silkscreen'] absolute left-1/2 transform -translate-x-1/2">
          TELA DE ABASTECIMENTO
        </h1>
        
        {/* Saldo */}
        <div className="text-right text-sm text-white font-['Silkscreen']">
          <div className="mb-1">
            R$ {playerBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs">SALDO FINAL: R$ {finalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Panel */}
        <div className="w-1/2 bg-white bg-opacity-15 backdrop-blur-sm border-r-4 border-purple-300 border-opacity-30 p-6 flex flex-col justify-start">
          {}
          <div className="bg-gradient-to-r from-yellow-300 to-amber-400 text-purple-900 px-6 py-3 border-4 border-purple-800 inline-block mb-6 font-bold text-lg self-start rounded shadow-lg font-['Silkscreen']">
            {vehicle.name.toUpperCase()}
          </div>

          {/* Vehicle Stats - fundo mais suave */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-4 border-purple-800 p-5 mb-5 text-sm rounded shadow-lg">
            <div className="grid grid-cols-2 gap-5 mb-5 text-purple-900">
              <div className="text-center">
                <div className="font-bold text-base mb-2 font-['Silkscreen']">CONSUMO</div>
                <div className="text-xl font-bold font-['Silkscreen']">{vehicle.consumption.asphalt} KM/L</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-base mb-2 font-['Silkscreen']">TANQUE</div>
                <div className="text-xl font-bold font-['Silkscreen']">{vehicle.currentFuel}L / {vehicle.maxCapacity}L</div>
              </div>
            </div>

            {/* Fuel Bar */}
            <div className="text-purple-900 mb-3 font-bold text-sm text-center font-['Silkscreen']">NÍVEL DO TANQUE</div>
            <div className="w-full bg-purple-200 border-4 border-purple-800 h-8 relative overflow-hidden rounded shadow-inner">
              <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-full transition-all duration-300 rounded-l" style={{ width: `${fuelPercentage}%` }} />
              <div className="absolute inset-0 flex items-center justify-center text-purple-900 font-bold text-sm font-['Silkscreen']">{fuelPercentage.toFixed(1)}%</div>
            </div>
          </div>

          {/* Vehicle Image */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-96 h-64 bg-gradient-to-br from-purple-50 to-white border-4 border-purple-800 flex items-center justify-center p-2 rounded shadow-xl">
              <img src={getVehicleImageUrl(vehicle.image)} alt="Veículo" className="w-full h-full object-contain" />
            </div>
          </div>

          {}
          <button
            onClick={handleSkip}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-purple-900 px-6 py-3 border-4 border-purple-800 font-bold text-sm rounded shadow-lg transition-all hover:scale-105 font-['Silkscreen']"
          >
            PULAR ABASTECIMENTO
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 bg-white bg-opacity-15 backdrop-blur-sm p-6 flex flex-col justify-start">
          {}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 border-4 border-purple-900 p-3 text-center mb-4 rounded shadow-lg">
            <h3 className="text-base font-bold text-white font-['Silkscreen']">POSTO DE COMBUSTÍVEL</h3>
          </div>

          {/* Fuel Type */}
          <div className="mb-6">
            <h4 className="text-purple-900 font-bold mb-3 text-xs bg-gradient-to-r from-yellow-200 to-amber-300 border-4 border-purple-800 p-2 inline-block rounded shadow-lg font-['Silkscreen']">ESCOLHA O COMBUSTÍVEL:</h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['DIESEL', 'GASOLINA', 'ALCOOL'].map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => setSelectedFuel(fuel)}
                  className={`px-4 py-3 border-4 border-purple-800 font-bold transition-all text-sm rounded shadow-lg hover:scale-105 font-['Silkscreen'] ${
                    selectedFuel === fuel
                      ? fuel === 'DIESEL'
                        ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white scale-105'
                        : fuel === 'GASOLINA'
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-900 scale-105'
                        : 'bg-gradient-to-r from-purple-400 to-violet-500 text-white scale-105'
                      : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 hover:from-purple-200 hover:to-purple-300'
                  }`}
                >
                  {fuel}
                </button>
              ))}
            </div>

            {/* Fuel Price */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 border-4 border-purple-900 p-3 text-center rounded shadow-lg">
              <div className="text-white font-bold text-sm font-['Silkscreen']">
                {selectedFuel}: R$ {FUEL_PRICES[selectedFuel].toFixed(2)} / LITRO
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <h4 className="text-purple-900 font-bold mb-3 text-xs bg-gradient-to-r from-yellow-200 to-amber-300 border-4 border-purple-800 p-2 inline-block rounded shadow-lg font-['Silkscreen']">ESCOLHA A QUANTIDADE:</h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['1/4 TANQUE', '1/2 TANQUE', 'TANQUE CHEIO'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`px-3 py-3 border-4 border-purple-800 font-bold text-xs transition-all rounded shadow-lg hover:scale-105 font-['Silkscreen'] ${
                    selectedAmount === amount
                      ? amount === '1/4 TANQUE'
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-purple-900 scale-105'
                        : amount === '1/2 TANQUE'
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-900 scale-105'
                        : 'bg-gradient-to-r from-emerald-400 to-green-500 text-white scale-105'
                      : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 hover:from-purple-200 hover:to-purple-300'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 border-4 border-purple-900 p-4 text-center mb-4 rounded shadow-xl">
            <div className="text-lg font-bold text-white font-['Silkscreen']">TOTAL: R$ {totalCost.toFixed(2)}</div>
          </div>

          {/* Refuel */}
          <button
            onClick={handleRefuel}
            disabled={totalCost > playerBalance}
            className={`w-full py-4 border-4 border-purple-900 font-bold text-base transition-all rounded shadow-xl font-['Silkscreen'] ${
              totalCost > playerBalance
                ? 'bg-gradient-to-r from-purple-300 to-purple-400 text-purple-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white hover:scale-105'
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
          <div className="bg-gradient-to-br from-red-600 to-red-700 border-4 border-red-900 rounded-lg p-8 max-w-lg mx-4 text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <img src="/alerta.png" alt="Alerta" className="w-16 h-16 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-6 font-['Silkscreen']">COMBUSTÍVEL ERRADO!</h2>
            <p className="text-white mb-6 font-['Silkscreen'] text-sm leading-relaxed">
              Multa de R$ {WRONG_FUEL_PENALTY.toFixed(2)} aplicada por tentar usar {selectedFuel} em um veículo a {vehicleFuelType}.
            </p>
            <p className="text-yellow-300 mb-8 text-sm font-['Silkscreen']">Veículo compatível com: {vehicleFuelType}</p>
            <button
              onClick={() => setShowPenaltyModal(false)}
              className="bg-gradient-to-r from-white to-gray-100 text-red-600 font-bold py-3 px-6 border-4 border-red-900 hover:from-gray-200 hover:to-gray-300 font-['Silkscreen'] text-sm rounded shadow-lg transition-all hover:scale-105"
            >
              ENTENDI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};