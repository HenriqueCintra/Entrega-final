import React, { useState } from 'react';
import { Vehicle } from '../../types/vehicle';

// Props do componente
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
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>({...vehicle});
  const [fuelAmount, setFuelAmount] = useState<'full' | 'half' | 'quarter'>('full');
  const [availableBalance, setAvailableBalance] = useState(availableMoney);
  const [previewFuel, setPreviewFuel] = useState<number>(vehicle.currentFuel);
  
  // Preço do diesel por litro (R$ 5,50)
  const fuelCostPerLiter = 5.5;

  // Cálculo do custo do abastecimento
  const calculateFuelCost = (option: 'full' | 'half' | 'quarter') => {
    const maxCapacity = selectedVehicle.maxCapacity;
    const currentFuel = selectedVehicle.currentFuel;
    
    let fuelToAdd = 0;
    
    switch (option) {
      case 'full':
        fuelToAdd = maxCapacity - currentFuel;
        break;
      case 'half':
        fuelToAdd = (maxCapacity / 2) - currentFuel;
        if (fuelToAdd < 0) fuelToAdd = 0;
        break;
      case 'quarter':
        fuelToAdd = (maxCapacity / 4) - currentFuel;
        if (fuelToAdd < 0) fuelToAdd = 0;
        break;
    }
    
    return fuelToAdd * fuelCostPerLiter;
  };

  // Handler para abastecimento
  const handleRefuel = () => {
    const cost = calculateFuelCost(fuelAmount);
    
    if (cost <= availableBalance) {
      const newCurrentFuel = fuelAmount === 'full' 
        ? selectedVehicle.maxCapacity 
        : fuelAmount === 'half' 
          ? Math.max(selectedVehicle.currentFuel, selectedVehicle.maxCapacity / 2)
          : Math.max(selectedVehicle.currentFuel, selectedVehicle.maxCapacity / 4);
      
      const updatedVehicle = {
        ...selectedVehicle,
        currentFuel: newCurrentFuel
      };
      
      const newBalance = availableBalance - cost;
      
      setSelectedVehicle(updatedVehicle);
      setAvailableBalance(newBalance);
      
      // Informar o componente pai sobre as mudanças
      onRefuel(updatedVehicle, newBalance);
    } else {
      alert('Saldo insuficiente para abastecer!');
    }
  };

  const calculatePreviewFuel = (option: 'full' | 'half' | 'quarter'): number => {
  const max = selectedVehicle.maxCapacity;
  const current = selectedVehicle.currentFuel;

  switch (option) {
    case 'full':
      return max;
    case 'half':
      return Math.max(current, max / 2);
    case 'quarter':
      return Math.max(current, max / 4);
  }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-[#200259] rounded-lg shadow-2xl border-4 border-black max-w-4xl w-full p-6 my-8">
        <h1 className="text-2xl font-['Silkscreen'] font-bold text-[#E3922A] text-center mb-4">
          ABASTECER VEÍCULO
        </h1>
        <p className="text-xl font-['Silkscreen'] text-white text-center mb-4">
          SALDO: R$ {availableBalance.toFixed(2)}
        </p>

        {/* Informações do veículo */}
        <div className="bg-[#FFC06F] p-4 rounded-lg shadow-md border-2 border-black mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Imagem do veículo */}
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
                  <p className="font-sans text-black text-md mb-1">ATUAL: {previewFuel.toFixed(2)}L</p>
                  <p className="font-sans text-black text-md mb-3">MÁXIMO: {selectedVehicle.maxCapacity}L</p>
                </div>
              </div>
              
              {/* Barra de combustível */}
              <p className="font-sans text-black text-md mb-2">NÍVEL DO TANQUE</p>
              <div className="w-full bg-gray-300 rounded-full h-6 border-2 border-black mb-4">
                <div
                  className="bg-green-500 h-full rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${(previewFuel / selectedVehicle.maxCapacity) * 100}%` }}
                >
                  {selectedVehicle.currentFuel}/{selectedVehicle.maxCapacity}
                </div>
              </div>
            </div>
          </div>
          
          {/* Opções de abastecimento */}
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
                      setFuelAmount('quarter');
                      setPreviewFuel(calculatePreviewFuel('quarter'));
                    }}
                    className={`flex-1 py-2 border-2 border-black rounded-md ${fuelAmount === 'quarter' ? 'bg-[#E3922A]' : 'bg-gray-200'}`}
                  >
                    1/4
                  </button>
                   <button 
                      onClick={() => {
                        setFuelAmount('half');
                        setPreviewFuel(calculatePreviewFuel('half'));
                      }} 
                    className={`flex-1 py-2 border-2 border-black rounded-md ${fuelAmount === 'half' ? 'bg-[#E3922A]' : 'bg-gray-200'}`}
                  >
                    1/2
                  </button>
                  <button 
                    onClick={() => {
                      setFuelAmount('full');
                      setPreviewFuel(calculatePreviewFuel('full'));
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
        
        {/* Botões de ação */}
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