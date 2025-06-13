// Definição do tipo de veículo
export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  consumption: {
    asphalt: number;
    dirt: number;
  };
  image: string;
  maxCapacity: number;
  currentFuel: number;
  cost: number; // Custo do aluguel + motorista
} 