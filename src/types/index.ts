// src/types/index.ts

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
  id: number;
  nome: string;
  stats: {
    people: number;
    trophy: number;
    trucks?: number;
    tasks?: number;
  };

  eficiencia_media?: number;

  color?: string;
  selected?: boolean;
  history?: TeamHistory[];
}

export interface Map {
  id: number;
  nome: string;
  descricao: string;
  rotas: any[]; // Pode ser tipado como Rota[] se necessário
}

// NOVAS INTERFACES PARA EQUIPES
export interface TeamCreationData {
  nome: string;
  descricao?: string;
}

export interface TeamMember {
  id: number;
  nickname: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  level?: number;
  xp?: number;
  avatar?: string;
}

export interface TeamDetails {
  id: number;
  nome: string;
  codigo: string;
  descricao?: string;
  lider: TeamMember;
  membros: TeamMember[];
  created_at: string;
  updated_at?: string;
}