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
  background,
  scale,
  children,
  position,
  onClick,
  layer = 1,
}) => {
  return (
    <button
      key="button"
      className="square-button"
      onClick={onClick}
      style={{
        border: `0.2rem solid ${background}`,
        background: `radial-gradient(${background}, rgba(0, 0, 0, 0))`,
      }}
      title={title}
    >
      {' '}
    </button>
  )
}
