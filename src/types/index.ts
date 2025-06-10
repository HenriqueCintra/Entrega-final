export interface TeamHistory {
  id: string;
  name: string;
  stats: {
    people: number;
    trophy: number;
    tasks?: number;
  };
  color: string;
}

export interface Team {
  id: string;
  name: string;
  stats: {
    people: number;
    trophy: number;
    trucks?: number;
    tasks?: number;
  };
  color?: string;
  selected?: boolean;
  history?: TeamHistory[];
}