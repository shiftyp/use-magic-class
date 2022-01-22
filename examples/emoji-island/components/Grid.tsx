import React from 'react'

import { useMagicClass } from 'use-magic-class/react'

import { Square, SquareBoundary } from './Square'

import { Game } from '../hooks/game'
import { GameContext } from '../hooks/contexts'
import { Emoji } from './Emoji'

export const Grid = ({ game }: { game: Game }) => {
  return (
    <GameContext.Provider value={game}>
      <foreignObject x="15" y="15" key="grid-object">
        <div className="grid-outer" key="grid-outer">
          <div className="grid" key="grid">
            <div className="grid-inner" key="grid-inner">
              {(() => {
                const ret = []
                for (let i = 0; i < game.scale ** 2; i++) {
                  const x = i % game.scale
                  const y = Math.floor(i / game.scale)

                  ret.push(
                    <div
                      key={`${x}-${y}`}
                      style={{
                        position: 'absolute',
                        top: `${y * 12}px`,
                        left: `${x * 12}px`,
                      }}
                    >
                      <Square title="" position={[x, y]} />
                    </div>
                  )
                }

                return ret
              })()}
              {game.map((entity) => (
                <Emoji key={entity.id} entity={entity} />
              ))}
            </div>
          </div>
        </div>
      </foreignObject>
    </GameContext.Provider>
  )
}
