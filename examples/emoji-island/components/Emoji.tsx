import React, { useEffect, useState } from 'react'

import { Entity } from '../hooks/entities'
import { useMagicClass } from '../../../magic/react'

export const Emoji = ({ entity, scale }: { entity: Entity; scale: number }) => {
  useMagicClass(entity)

  const [emoji, setEmoji] = useState<string | null>(null)

  useEffect(() => {
    const element = document.getElementById(entity.emoji)

    if (element) {
      const svg = document.createElement('svg')
      svg.innerHTML = element.outerHTML
      const innerElement = svg.children[0]! as SVGElement
      innerElement.setAttribute(
        'transform',
        `scale(${0.1666666 * entity.scale * scale})`
      )
      innerElement.setAttribute(
        'transform-origin',
        `${[-2.5, -2.5].map(coord => (coord * entity.scale + 1.5) * scale).join(' ')}`
      )
      setEmoji(innerElement.outerHTML)
    }
  }, [entity.emoji])

  return entity.position.find((coord) => coord < 0)
    ? null
    : emoji && (
        <g
          height={12 * scale}
          widths={12 * scale}
          style={{
            transform: `translate(${
              (entity.position[0] * 12 + 1 / entity.scale) * scale
            }px,${
              (entity.position[1] * 12 + 1 / entity.scale) * scale
            }px`,
          }}
          onClick={() => entity.interact()}
          dangerouslySetInnerHTML={{ __html: emoji }}
        >
          {/* <use
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
      /> */}
        </g>
      )
}
