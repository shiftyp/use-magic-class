import React, { useEffect } from 'react'

import { useMagicClass } from 'use-magic-class/react'

import { Square, SquareBoundary } from './Square'

import { Game } from '../hooks/game'
import { GameContext } from '../hooks/contexts'
import { Emoji } from './Emoji'

export const Grid = ({
  game,
  scale,
  bg,
  isOverlay,
  mouseMove,
  mouseLeave,
  translation,
}: {
  game: Game
  scale: number
  bg: string
  isOverlay: boolean
  mouseMove?: (e: React.MouseEvent<SVGGElement>) => void
  mouseLeave?: (e: React.MouseEvent<SVGGElement>) => void
  translation?: [x: number, y: number]
}) => {  
  return (
    <GameContext.Provider value={game}>
      <g
        className="grid-outer"
        key="grid-outer"
        style={{
          transform: isOverlay ? 'translateZ(2px)' : 'translateZ(0px)',
          pointerEvents: isOverlay ? 'none' : 'all',
          clipPath: isOverlay ? 'url(#mag)' : 'none',
        }}
        onMouseLeave={mouseLeave}
        onMouseMove={mouseMove}
      >
        <g className="grid" key="grid">
          <g
            className="grid-inner"
            key="grid-inner"
            style={{
              height: game.scale * 12 * scale,
              width: game.scale * 12 * scale,
              background: isOverlay ? 'black' : 'transparent',
            }}
          >
            {(() => {
              const ret = []
              for (let i = 0; i < game.scale ** 2; i++) {
                const x = i % game.scale
                const y = Math.floor(i / game.scale)

                ret.push(
                  <g key={`${x}-${y}`}>
                    <Square title="" position={[x, y]} scale={scale} bg={bg} />
                  </g>
                )
              }

              return ret
            })()}
            {game.map((entity) => (
              <Emoji key={entity.id} entity={entity} scale={scale} />
            ))}
          </g>
        </g>
      </g>
    </GameContext.Provider>
  )
}
