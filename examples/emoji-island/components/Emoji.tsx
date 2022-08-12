import React from 'react'

import { Entity } from '../hooks/entities'
import { useMagicClass } from 'use-magic-class/react'

export const Emoji = ({ entity, scale }: { entity: Entity; scale: number }) => {
  useMagicClass(entity)

  return entity.position.find((coord) => coord < 0) ? null : (
    <g className='emoji'><g
      height={12 * scale}
      widths={12 * scale}
      style={{
        transform: `translate(${
          (entity.position[0] * 12 + 1 / entity.scale) * scale
        }px,${(entity.position[1] * 12 + 1 / entity.scale) * scale}px) scale(${
          0.1666666 * entity.scale * scale
        })`,
      }}
    >
      <use xlinkHref={`#${entity.emoji}`} />
    </g></g>
  )
}
