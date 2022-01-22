import React from 'react'

import { Entity } from '../hooks/entities'
import { useMagicClass } from '../../../magic/react'

export const Emoji = ({ entity }: { entity: Entity }) => {
  useMagicClass(entity)

  return entity.position.find((coord) => coord < 0) ? null : (
    <button
      className="square-button"
      onClick={() => entity.interact()}
      style={{
        position: 'absolute',
        top: `${entity.position[1] * 12}px`,
        left: `${entity.position[0] * 12}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
      }}
    >
      <span
        key="emoji"
        className="emoji"
        role="img"
        style={{
          textAlign: 'center',
          display: 'block',
          fontSize: `${entity.scale}rem`,
        }}
      >
        {entity.emoji}
      </span>
    </button>
  )
}
