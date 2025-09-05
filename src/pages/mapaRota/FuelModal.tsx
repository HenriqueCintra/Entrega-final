// src/pages/mapaRota/FuelModal.tsx

import React, { useState } from 'react';
import { Vehicle } from '../../types/vehicle';

interface FuelModalProps {
  vehicle: Vehicle;
  availableMoney: number;
  onRefuel: (updatedVehicle: Vehicle, newBalance: number) => void;
  onClose: () => void;
}

export const FuelModal: React.FC<FuelModalProps> = ({
  vehicle,
  availableMoney,
  onRefuel,
  onClose
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>({ ...vehicle });
  const [fuelAmount, setFuelAmount] = useState<'full' | 'half' | 'quarter'>('full');
  const [availableBalance, setAvailableBalance] = useState(availableMoney);
  const [previewFuel, setPreviewFuel] = useState<number>(vehicle.maxCapacity); // Preview inicia com a opção 'full' selecionada

  const fuelCostPerLiter = 5.5;

  const calculateFuelCost = (option: 'full' | 'half' | 'quarter') => {
    const maxCapacity = selectedVehicle.maxCapacity;
    let fuelToAdd = 0;

    // Como o tanque sempre começa vazio, calculamos a quantidade total desejada
    switch (option) {
      case 'full':
        fuelToAdd = maxCapacity;
        break;
      case 'half':
        fuelToAdd = maxCapacity / 2;
        break;
      case 'quarter':
        fuelToAdd = maxCapacity / 4;
        break;
    }

    return fuelToAdd * fuelCostPerLiter;
  };

  const handleRefuel = () => {
    const cost = calculateFuelCost(fuelAmount);

    if (cost <= availableBalance) {
      // Calcular o novo combustível baseado na opção selecionada
      const newCurrentFuel = fuelAmount === 'full'
        ? selectedVehicle.maxCapacity
        : fuelAmount === 'half'
          ? selectedVehicle.maxCapacity / 2
          : selectedVehicle.maxCapacity / 4;

      const updatedVehicle = {
        ...selectedVehicle,
        currentFuel: newCurrentFuel
      };

      const newBalance = availableBalance - cost;

      setSelectedVehicle(updatedVehicle);
      setAvailableBalance(newBalance);

      onRefuel(updatedVehicle, newBalance);
    } else {
      alert('Saldo insuficiente para abastecer!');
    }
  };

  const calculatePreviewFuel = (option: 'full' | 'half' | 'quarter'): number => {
    const max = selectedVehicle.maxCapacity;

    switch (option) {
      case 'full':
        return max;
      case 'half':
        return max / 2;
      case 'quarter':
        return max / 4;
      default:
        return 0; // Tanque vazio por padrão
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-[#200259] rounded-lg shadow-2xl border-4 border-black max-w-4xl w-full p-6 my-8">
        <h1 className="text-2xl font-['Silkscreen'] font-bold text-[#E3922A] text-center mb-4">
          ABASTECER VEÍCULO
        </h1>
        <p className="font-['Silkscreen'] text-white text-center text-md font-bold text-xl">
          Saldo após: R$ {(availableMoney - calculateFuelCost(fuelAmount)).toFixed(2)}
        </p>

        <div className="bg-[#FFC06F] p-4 rounded-lg shadow-md border-2 border-black mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex justify-center items-center md:w-1/3">
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="h-40 object-contain"
              />
            </div>

            <div className="md:w-2/3">
              <h2 className="text-xl font-['Silkscreen'] font-bold mb-3 text-black text-center border-b-2 border-black pb-2">
                {selectedVehicle.name.toUpperCase()}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">CONSUMO</h3>
                  <p className="font-sans text-black text-md mb-1">- ASFALTO: {selectedVehicle.consumption.asphalt}KM/L</p>
                  <p className="font-sans text-black text-md mb-3">- TERRA: {selectedVehicle.consumption.dirt}KM/L</p>
                </div>

                <div>
                  <h3 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">COMBUSTÍVEL</h3>
                  <p className="font-sans text-black text-md mb-1">ATUAL: 0L</p>
                  <p className="font-sans text-black text-md mb-3">MÁXIMO: {selectedVehicle.maxCapacity}L</p>
                </div>
              </div>

              <p className="font-sans text-black text-md mb-2">NÍVEL DO TANQUE</p>
              <div className="w-full bg-gray-200 rounded-full h-6 border-2 border-black mb-4 relative overflow-hidden shadow-inner">
                {/* Fundo branco (tanque vazio) */}
                <div className="w-full h-full bg-white rounded-full"></div>
                
                {/* Barra de preview - quantidade que será abastecida (verde) */}
                <div
                  className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-full absolute top-0 left-0 transition-all duration-300"
                  style={{ width: `${(previewFuel / selectedVehicle.maxCapacity) * 100}%` }}
                ></div>
                
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black">
                  0L → {previewFuel.toFixed(0)}L / {selectedVehicle.maxCapacity}L
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">ABASTECER</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-sans text-black text-md mb-2">PREÇO DO DIESEL: R$ {fuelCostPerLiter.toFixed(2)}/L</p>
              </div>

              <div className="md:col-span-2">
                <div className="flex space-x-2 mb-2">
                  <button
                    onClick={() => {
                      const newPreview = calculatePreviewFuel('quarter');
                      setFuelAmount('quarter');
                      setPreviewFuel(newPreview);
                    }}
                    className={`flex-1 py-2 border-2 border-black rounded-md ${fuelAmount === 'quarter' ? 'bg-[#E3922A]' : 'bg-gray-200'}`}
                  >
                    1/4
                  </button>
                  <button
                    onClick={() => {
                      const newPreview = calculatePreviewFuel('half');
                      setFuelAmount('half');
                      setPreviewFuel(newPreview);
                    }}
                    className={`flex-1 py-2 border-2 border-black rounded-md ${fuelAmount === 'half' ? 'bg-[#E3922A]' : 'bg-gray-200'}`}
                  >
                    1/2
                  </button>
                  <button
                    onClick={() => {
                      const newPreview = calculatePreviewFuel('full');
                      setFuelAmount('full');
                      setPreviewFuel(newPreview);
                    }}
                    className={`flex-1 py-2 border-2 border-black rounded-md ${fuelAmount === 'full' ? 'bg-[#E3922A]' : 'bg-gray-200'}`}
                  >
                    CHEIO
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <p className="font-sans text-black text-md font-bold text-xl">
                Custo: R$ {calculateFuelCost(fuelAmount).toFixed(2)}
              </p>

              <button
                onClick={handleRefuel}
                className="bg-[#E3922A] text-black font-bold py-2 px-4 rounded-md w-full shadow-md border-2 border-black hover:bg-[#FFC06F]"
              >
                ABASTECER
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white font-bold py-3 px-8 rounded-md shadow-md border-2 border-black hover:bg-gray-700"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};