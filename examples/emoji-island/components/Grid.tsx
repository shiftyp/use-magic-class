import React from 'react'

import { useMagicClass } from 'use-magic-class/react'

import { Square } from './Square'

import { Game } from '../hooks/game'
import { GameContext } from '../hooks/contexts'


export const Grid = () => {
  const game = useMagicClass(Game)

  return (
    <GameContext.Provider value={game}>
    <foreignObject x="10" y="15">
      <div className="grid-outer">
        <div className="grid">
          <div className="grid-inner">
            {game.map((entity, x, y) => (
              <Square key={entity.id} title="" position={[x, y]} entity={entity} />
            ))}
          </div>
        </div>
      </div>
    </foreignObject>
    </GameContext.Provider>
  )
}
