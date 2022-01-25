import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'
import { Grid } from './Grid'
import { useMagicClass } from 'use-magic-class/react'
import { Game } from '../hooks/game'

const islandPath =
  'm97.761463,-4.0381c18.427334,-1.280909 16.683508,25.048933 19.156094,40.586017c2.472602,15.537084 1.067116,48.949192 -6.715047,62.994304c-7.782163,14.045098 -21.941018,8.748924 -36.698514,14.150895c-14.783514,5.427692 -33.288932,-1.165823 -48.905324,-6.670693c-15.64241,-5.530578 -26.808122,1.770075 -34.980706,-11.812009c-8.172569,-13.607806 -12.050641,-42.482334 -8.615041,-58.096582c3.409582,-15.614248 2.420551,-35.301098 14.809547,-44.715954c12.388996,-9.414842 38.156036,-8.557705 54.058732,-8.892112c15.876663,-0.334407 29.46291,13.737044 47.89026,12.456134z'

const throttle = <Args extends any[]>(
  cb: (...args: Args) => void,
  time: number
) => {
  let last: number | null = null

  return (...args: Args) => {
    const now = performance.now()
    if (!last || now - last >= time) {
      cb(...args)
      last = now
    }
  }
}

export const Island = () => {
  const game = useMagicClass(Game)

  const [svg, setSvg] = useState<SVGSVGElement | null>(null)
  const [grid, setGrid] = useState<SVGGElement | null>(null)
  const sizeRef = useRef<number>(0)

  const turbulenceFreq = useMemo(() => 0.04 * (game.scale / 7), [game.scale])

  const [mousePosition, setMousePosition] = useState<
    [x: number, y: number] | null
  >(null)

  const mouseMove = useCallback(
    throttle((e) => {
      setMousePosition([e.clientX, e.clientY])
    }, 50),
    [svg]
  )

  return (
    <AutoSizer>
      {({ height, width }) => {
        let gridRect: DOMRect | null = null

        if (grid && svg) {
          const { x, y, width, height } = grid?.getBoundingClientRect()
          const origin = svg.createSVGPoint()
          const extreme = svg.createSVGPoint()

          origin.x = x
          origin.y = y

          extreme.x = width
          extreme.y = height

          const matrix = svg.getScreenCTM()!.inverse()

          origin.matrixTransform(matrix)
          extreme.matrixTransform(matrix)

          gridRect = new DOMRect(origin.x, origin.y, extreme.x, extreme.y)
        }

        const size = Math.min(height, width)
        sizeRef.current = size
        return (
          <>
            <div
              className="island-outer"
              style={{
                position: 'relative',
                height,
                width,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <svg
                ref={setSvg}
                id="island"
                className="island"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 300 300"
                height={size}
                width={size}
                z={0}
              >
                <defs>
                  <clipPath id="mag" clipPathUnits="userSpaceOnUse">
                    <circle
                      r={50}
                      fill="black"
                      cx={
                        mousePosition &&
                        mousePosition[0] - (width - size) / 2 - 25 + 90
                      }
                      cy={
                        mousePosition &&
                        mousePosition[1] - (height - size) / 2 + 90
                      }
                    />
                    <circle
                      r={50}
                      fill="black"
                      cx={
                        mousePosition &&
                        mousePosition[0] - (width - size) / 2 + 25 + 90
                      }
                      cy={
                        mousePosition &&
                        mousePosition[1] - (height - size) / 2 + 90
                      }
                    />
                  </clipPath>
                  <radialGradient id="color">
                    <stop offset="0%" stopColor="rgb(120, 200, 180)" />
                    <stop offset="70%" stopColor="rgb(120, 200, 180)" />
                    <stop offset="99%" stopColor="rgb(255, 238, 182)" />
                  </radialGradient>
                  <filter id="displacementFilter">
                    <feTurbulence
                      type="turbulence"
                      baseFrequency={turbulenceFreq}
                      numOctaves="2"
                      result="turbulence"
                    />
                    <feDisplacementMap
                      in2="turbulence"
                      in="SourceGraphic"
                      scale="30"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                  <filter id="sand">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="100"
                      result="noise"
                    />
                    <feColorMatrix
                      in="noise"
                      type="saturate"
                      values="0"
                      result="saturation"
                    />
                    <feTurbulence
                      type="turbulence"
                      baseFrequency={turbulenceFreq}
                      numOctaves="2"
                      result="turbulence"
                    />
                    <feColorMatrix
                      in="turbulence"
                      type="luminanceToAlpha"
                      values="0"
                      result="luminance"
                    />
                    <feBlend
                      in="SourceGraphic"
                      in2="saturation"
                      mode="multiply"
                      result="sand"
                    />
                    <feBlend
                      in="SourceGraphic"
                      in2="luminance"
                      mode="multiply"
                      result="dunes"
                    />
                    <feBlend
                      in="dunes"
                      in2="sand"
                      mode="overlay"
                      result="fill"
                    />
                    <feMorphology
                      in="SourceAlpha"
                      operator="erode"
                      radius="1"
                    />
                    <feComposite in="fill" operator="in" result="fill-area" />
                    <feMerge>
                      <feMergeNode in="fill-area" />
                    </feMerge>
                  </filter>
                  <filter id="f1" x="0" y="0" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.2" />
                  </filter>

                  <symbol id="island-group">
                    <g filter="url(#sand) url(#displacementFilter) url(#f1)">
                      <path
                        className="ground"
                        d={islandPath}
                        strokeWidth="0.5rem"
                        fill="url(#color)"
                        transform="translate(100, 100) scale(1.5)"
                      >
                        <animate
                          id="waves"
                          dur="10s"
                          begin="0s"
                          repeatCount="indefinite"
                          attributeName="stroke-width"
                          values={`
                      0;
                      0.25rem;
                      0.75rem;
                      0.25rem:
                      0;
                  `}
                        />
                      </path>
                    </g>
                    <g key="grid-object">
                      <g
                        ref={setGrid}
                        style={{
                          transform: 'translate(120px, 120px)',
                        }}
                      >
                        <Grid
                          game={game}
                          scale={120 / (game.scale * 12)}
                          bg="rgba(150, 150, 150, 0.2)"
                          isOverlay={false}
                        />
                      </g>
                    </g>
                  </symbol>
                </defs>
                <foreignObject x="140" y="250">
                  <form
                    style={{
                      fontSize: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <label
                      style={{
                        transform: 'translate(-50%, 0)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <input
                        title="Island Size"
                        type="range"
                        min={3}
                        max={20}
                        step={1}
                        defaultValue={game.scale}
                        onMouseDown={() => {
                          game.clearEntities()

                          const handler = () => {
                            game.makeEntities()
                            window.removeEventListener('mouseup', handler)
                            window.removeEventListener('mouseleave', handler)
                          }

                          window.addEventListener('mouseup', handler)
                          window.addEventListener('mouseleave', handler)
                        }}
                        onChange={(e) => {
                          game.scale = e.target.valueAsNumber
                        }}
                        style={{
                          fontSize: '0.25rem',
                        }}
                      />
                    </label>
                  </form>
                </foreignObject>
                <g
                  transform="translate(-40, -40)"
                  //clipPath="url(#mag)"
                >
                  <g
                    style={{
                      transform: `translateZ(0px)`,
                    }}
                  >
                    <use href="#island-group" />
                  </g>
                </g>
              </svg>

              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  top: 0,
                  left: 0,
                  perspective: '6px',
                  perspectiveOrigin: mousePosition
                    ? `${mousePosition[0]}px ${mousePosition[1]}px`
                    : '0 0',
                  width: width,
                  height: height,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    transform: `translateZ(${4 * (game.scale / 20) + 0.5}px)`,
                  }}
                >
                  <svg
                    style={{
                      transform: 'translate(-90px, -90px)',
                    }}
                    clipPath="url(#mag)"
                    height={size}
                    width={size}
                    viewBox="0 0 300 300"
                  >
                    <use href="#island-group" />
                  </svg>
                </div>
              </div>

              {gridRect && (
                <div
                  style={{
                    transform: 'translate(-90px, -90px)',
                    position: 'absolute',
                    left: gridRect.x,
                    top: gridRect.y,
                    width: gridRect.width,
                    height: gridRect.height,
                  }}
                  onMouseMove={mouseMove}
                  onMouseLeave={() => {
                    setMousePosition(null)
                  }}
                  onClick={(e) => {
                    const x = Math.floor(
                      (e.clientX - gridRect!.x + 90) /
                        (gridRect!.width / game.scale)
                    )
                    const y = Math.floor(
                      (e.clientY - gridRect!.y + 90) /
                        (gridRect!.height / game.scale)
                    )
                    game.interactAt(x, y)
                  }}
                ></div>
              )}
            </div>
          </>
        )
      }}
    </AutoSizer>
  )
}
