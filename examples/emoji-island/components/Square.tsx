import React from 'react'
import { useMagicClass } from 'use-magic-class/react'
import { Entity } from '../hooks/entities'

export type SquareProps = {
  title: string
  bg?: string
  scale: number
  position: [number, number]
  transition?: string
  onClick?: () => void
  layer?: number
  animate?: boolean
  className?: string
}

export class SquareBoundary extends React.Component<
  { entity: Entity },
  { hasError: boolean }
> {
  constructor(props: { entity: Entity }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <button className="square-button" style={{ background: 'red' }}>
          {this.props.entity.emoji}
        </button>
      )
    }
    return this.props.children
  }
}

export const Square: React.FunctionComponent<SquareProps> = ({
  title,
  bg = 'none',
  scale,
  children,
  position,
  onClick,
  layer = 1,
}) => {
  return (
    <rect
      className="square-button"
      style={{
        stroke: `0.2rem solid ${bg}`,
        fill: bg,
        height: 12 * scale,
        width: 12 * scale,
      }}
      x={position[0] * 12 * scale}
      y={position[1] * 12 * scale}
      rx={3 * scale}
      ry={3 * scale}
    >
      {' '}
    </rect>
  )
}
