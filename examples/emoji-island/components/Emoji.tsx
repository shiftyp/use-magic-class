import React from 'react'

import { Entity } from '../hooks/entities'
import { useMagicClass } from '../../../magic/react'

export const Emoji = ({ entity, scale }: { entity: Entity; scale: number }) => {
  useMagicClass(entity)

  return entity.position.find((coord) => coord < 0) ? null : (
    <g
      style={{
        transform: `translate(${entity.position[0] * 12 * scale}px,${
          (entity.position[1] * 12) * scale
        }px`,
      }}
    >
      <use
        key="emoji"
        className="emoji"
        role="img"
        height={12 * scale}
        width={12 * scale}
        onClick={() => entity.interact()}
        xlinkHref={`#${entity.emoji}`}
        style={{
          transform: `scale(${0.1666666 * entity.scale})`,
        }}
      />
    </g>
  )
}
