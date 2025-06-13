import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from '../../types/vehicle';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  MapPin,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { Button } from "@/components/ui/button";

import caminhaoMedioPng from '@/assets/caminhao_medio.png';
import camihaoPequenoPng from '@/assets/caminhao_pequeno.png';
import carretaPng from '@/assets/carreta.png';
import camhionetePng from '@/assets/caminhonete.png';

const vehicles: Vehicle[] = [
    
  {
    id: 'caminhao_pequeno',
    name: 'Caminhão Pequeno',
    capacity: 20,
    consumption: { asphalt: 4, dirt: 3 },
    image: camihaoPequenoPng,
    maxCapacity: 200,
    currentFuel: 50, cost: 1500
  },
  {
    id: 'carreta',
    name: 'Carreta',
    capacity: 60,
    consumption: { asphalt: 2, dirt: 1.5 },
    image: carretaPng,
    maxCapacity: 500,
    currentFuel: 120,
    cost: 4500

  },
  {
    id: 'caminhao_medio',
    name: 'Caminhão Médio',
    capacity: 40,
    consumption: { asphalt: 3, dirt: 2 },
    image: caminhaoMedioPng,
    maxCapacity: 300,
    currentFuel: 75,
    cost: 2500
  },
  {
    id: 'caminhonete',
    name: 'Caminhonete', capacity: 10,
    consumption: { asphalt: 8, dirt: 6 },
    image: camhionetePng, maxCapacity: 100,
    currentFuel: 25, cost: 800
  },
];

const VehicleCard: React.FC<{
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ vehicle, isSelected, onSelect }) => (
  <div
    className={`
      relative min-w-[280px] max-w-[320px] mx-4 cursor-pointer transition-transform duration-300
      ${isSelected ? 'scale-105 border-4 border-orange-500' : 'hover:scale-105 border border-gray-200'}
      bg-white p-4 rounded-xl shadow-xl flex flex-col justify-between
    `}
    onClick={onSelect}
  >
    <div>
      <div className="flex justify-center mb-2">
        <img src={vehicle.image} alt={vehicle.name} className="h-48 object-contain" />
      </div>
       
      <h3 className="font-['Silkscreen'] text-center text-xl font-bold mb-2">{vehicle.name}</h3>
      <ul className="text-sm space-y-1">
        <li>🧱 Capacidade: {vehicle.capacity} caixas</li>
        <li>🛢️ Tanque: {vehicle.maxCapacity} L</li>
        <li>🚗 Asfalto: {vehicle.consumption.asphalt} KM/L</li>
      </ul>
    </div>
     
    <p className="font-['Silkscreen'] text-orange-600 font-bold text-center mt-3 text-lg">
      R$ {vehicle.cost.toLocaleString()}
    </p>
  </div>
);

export const VehicleSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availableMoney] = useState(10000);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
    api.scrollTo(selectedIndex);
    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, selectedIndex]);

  const handleVehicleSelect = (index: number) => {
    setSelectedIndex(index);
    setShowConfirmation(true);
  };

   const handleConfirm = () => {
    const selectedVehicle = vehicles[selectedIndex];
    if (selectedVehicle.cost <= availableMoney) {
      navigate('/mapa-rota', {
        state: {
          selectedVehicle: selectedVehicle,
          availableMoney: availableMoney - selectedVehicle.cost
        }
      });
    }
  };

  return (
    <div className="bg-sky-100 min-h-screen flex flex-col items-center justify-center px-4 py-8">
       
      <div className="font-['Silkscreen'] text-lg absolute top-4 right-4">
        R$ {availableMoney.toLocaleString()}
      </div>

       
      <h1 className="font-['Silkscreen'] text-3xl mb-8 text-center">
        ESCOLHA UM CAMINHÃO
      </h1>

      <div className="relative w-full max-w-[1200px] px-16">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4 py-4 font-['Silkscreen'] ">
            {vehicles.map((vehicle, index) => (
              <CarouselItem key={index} className="basis-auto md:basis-1/2 lg:basis-1/3 pl-4">
                <VehicleCard
                  vehicle={vehicle}
                  isSelected={selectedIndex === index}
                  onSelect={() => handleVehicleSelect(index)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="hidden md:flex opacity-100 -left-4 h-14 w-14 bg-orange-500 hover:bg-orange-600 transition-all duration-300 ease-in-out
               hover:scale-110 text-white border-none rounded-sm" />
          <CarouselNext className="hidden transition-all duration-300 ease-in-out
               hover:scale-110 md:flex opacity-100 -right-4 h-14 w-14 bg-orange-500 hover:bg-orange-600 text-white border-none rounded-sm" />
        </Carousel>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation} >
        <DialogContent className="sm:max-w-md font-['Silkscreen']">
          <DialogHeader className="font-['Silkscreen']">
            
            <DialogTitle className="font-['Silkscreen'] flex items-center gap-2 text-xl">
              Veículo Selecionado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex items-center gap-4">
                <img src={vehicles[selectedIndex].image} className="h-16 w-16 object-contain" />
                <div>
                
                  <p className="font-['Silkscreen'] font-bold text-base">{vehicles[selectedIndex].name}</p>
                  <ul className="text-xs">
                    <li>Capacidade: {vehicles[selectedIndex].capacity} caixas</li>
                    <li>Tanque: {vehicles[selectedIndex].maxCapacity} L</li>
                    <li>Asfalto: {vehicles[selectedIndex].consumption.asphalt} KM/L</li>
                    <li>Terra: {vehicles[selectedIndex].consumption.dirt} KM/L</li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1 text-base">Detalhes da Reserva</h4>
              <div className="text-sm space-y-1">
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} /> Data/Hora: Agora
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} /> Local de Retirada: Base
                </p>
                <p className="font-['Silkscreen'] flex items-center gap-2 text-lg font-bold">
                  <DollarSign size={16} /> Total: R$ {vehicles[selectedIndex].cost.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 font-['Silkscreen']">
            
            <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 font-['Silkscreen']">
              Confirmar
            </Button>
            <Button variant="destructive" onClick={() => setShowConfirmation(false)} className="font-['Silkscreen']">
              Cancelar
            </Button>
          </DialogFooter >
        </DialogContent>
      </Dialog>
    </div>
  );
};

