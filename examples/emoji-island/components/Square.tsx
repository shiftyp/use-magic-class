import React from 'react'
import { useMagicClass } from 'use-magic-class/react'
import { Entity } from '../hooks/entities'

export type SquareProps = {
  title: string
  background?: string
  scale?: number
  position: [number, number]
  transition?: string
  onClick?: () => void
  layer?: number
  animate?: boolean
  className?: string,
  entity: Entity
}

export const Square: React.FunctionComponent<SquareProps> = ({
  title,
  background,
  scale,
  children,
  position,
  onClick,
  layer = 1,
  entity,
}) => {
  useMagicClass(entity)
  return (<button
    key="button"
    className="square-button"
    onClick={onClick}
    style={{
      top: `${position[1] * 12 + 5}px`,
      left: `${position[0] * 12 + 5}px`,
      border: `0.2rem solid ${background}`,
      background: `radial-gradient(${background}, rgba(0, 0, 0, 0))`,
    }}
    title={title}
  >
    <span
      key="emoji"
      className="square"
      role="img"
      aria-label={title}
      style={{
        zIndex: layer,
      }}
    >
      {entity.emoji}
    </span>
  </button>
)
    }