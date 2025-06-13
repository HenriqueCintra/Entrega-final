import { Team } from '../types';

export const TEAMS: Team[] = [
  {
    id: 'team1',
    name: 'ENTREGA RÁPIDA',
    stats: {
      people: 4,
      trophy: 25,
    },
    selected: false,
    history: [
      {
        id: 'history1',
        name: 'ENTREGA EFICIENTE',
        stats: {
          people: 3,
          trophy: 15,
          tasks: 4
        },
        color: 'bg-yellow-500'
      },
      {
        id: 'history2',
        name: 'JOGO 2',
        stats: {
          people: 2,
          trophy: 10,
          tasks: 3
        },
        color: 'bg-cyan-500'
      },
      {
        id: 'history3',
        name: 'JOGO 3',
        stats: {
          people: 2,
          trophy: 5,
          tasks: 1
        },
        color: 'bg-emerald-500'
      }
    ]
  },
  {
    id: 'team2',
    name: 'FRUIT VALE',
    stats: {
      people: 4,
      trophy: 5,
      trucks: 3
    },
    selected: false,
    history: [
      {
        id: 'history1',
        name: 'ENTREGA EFICIENTE',
        stats: {
          people: 3,
          trophy: 15,
          tasks: 4
        },
        color: 'bg-yellow-500'
      },
      {
        id: 'history2',
        name: 'JOGO 2',
        stats: {
          people: 2,
          trophy: 10,
          tasks: 3
        },
        color: 'bg-cyan-500'
      },
      {
        id: 'history3',
        name: 'JOGO 3',
        stats: {
          people: 2,
          trophy: 5,
          tasks: 1
        },
        color: 'bg-emerald-500'
      }
    ]
  }
];