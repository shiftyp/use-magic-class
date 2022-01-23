import React, { useEffect, useMemo, useRef, useState } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'
import { Grid } from './Grid'
import { useMagicClass } from 'use-magic-class/react'
import { Game } from '../hooks/game'
import { image } from 'faker'

const islandPath =
  'm97.761463,-4.0381c18.427334,-1.280909 16.683508,25.048933 19.156094,40.586017c2.472602,15.537084 1.067116,48.949192 -6.715047,62.994304c-7.782163,14.045098 -21.941018,8.748924 -36.698514,14.150895c-14.783514,5.427692 -33.288932,-1.165823 -48.905324,-6.670693c-15.64241,-5.530578 -26.808122,1.770075 -34.980706,-11.812009c-8.172569,-13.607806 -12.050641,-42.482334 -8.615041,-58.096582c3.409582,-15.614248 2.420551,-35.301098 14.809547,-44.715954c12.388996,-9.414842 38.156036,-8.557705 54.058732,-8.892112c15.876663,-0.334407 29.46291,13.737044 47.89026,12.456134z'

const fieldOfView = (
  z: number,
  [x, y]: [x: number, y: number],
  perspective: number
) => {
  const vFOV = 2 * Math.atan(y / (2 * perspective))
  const height = 2 * Math.tan(vFOV / 2) * (z + perspective)
  const hFOV = 2 * Math.atan(x / (2 * perspective))
  const width = 2 * Math.tan(hFOV / 2) * (z + perspective)

  return {
    z,
    x: width,
    y: height,
  }
}

export const Island = () => {
  const game = useMagicClass(Game)

  const [svg, setSvg] = useState<SVGSVGElement | null>(null)
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const overlay = useRef<SVGGElement | null>(null)

  const turbulenceFreq = useMemo(() => 0.04 * (game.scale / 7), [game.scale])

  const [mousePosition, setMousePosition] = useState<
    [x: number, y: number] | null
  >(null)
  const [overlayTranslation, setOverlayTranslation] = useState<
    [x: number, y: number] | null
  >(null)

  const sizeRef = useRef<number>(0)

  useEffect(() => {
    if (svg && canvas) {
      let objectUrl: string | null = null
      const cb = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
        }
        const div = document.createElement('div')
        div.innerHTML = svg.outerHTML
        const bigSvg = div.querySelector('svg')!
        bigSvg.setAttribute('height', `${sizeRef.current * 12}`)
        bigSvg.setAttribute('width', `${sizeRef.current * 12}`)
        objectUrl = URL.createObjectURL(new Blob([div.innerHTML], {type:'image/svg+xml;charset=utf-8'}))

        const image = new Image()

        image.onload = () => {
          const context = canvas.getContext('2d')
          context!.clearRect(0, 0, sizeRef.current, sizeRef.current)
          context!.fillStyle = 'rgb(46, 160, 212)'
          context!.rect(0, 0, sizeRef.current, sizeRef.current)
          canvas.getContext('2d')?.drawImage(image, 0, 0, sizeRef.current, sizeRef.current)
        }

        image.src = objectUrl
      }

      const observer = new MutationObserver(cb)

      cb()

      observer.observe(svg, {
        childList: true,
        subtree: true,
      })

      return () => observer.disconnect()
    }
  }, [svg, canvas])

  return (
    <AutoSizer>
      {({ height, width }) => {
        const size = Math.min(height, width)
        sizeRef.current = size
        return (
          <div
            className="island-outer"
            style={{
              position: 'relative',
              height,
              width,
              display: 'flex',
              flexDirection: 'column',
              perspective: '6px',
              perspectiveOrigin: mousePosition
                ? `${mousePosition[0]}px ${mousePosition[1]}px`
                : '0 0',
            }}
          >
            <svg
              ref={setSvg}
              id="island"
              className="island"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-25 -25 175 175"
              height={size}
              width={size}
              z={0}
            >
              <defs>
                <clipPath id="mag">
                  <circle
                    r={100}
                    fill="black"
                    cx={mousePosition && mousePosition[0] - (width - size) / 2}
                    cy={mousePosition && mousePosition[1] - (height - size) / 2}
                  />
                  <circle
                    r={100}
                    fill="black"
                    cx={mousePosition && mousePosition[0] - (width - size) / 2 + 50}
                    cy={mousePosition && mousePosition[1] - (height - size) / 2}
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
                  <feBlend in="dunes" in2="sand" mode="overlay" result="fill" />
                  <feMorphology in="SourceAlpha" operator="erode" radius="1" />
                  <feComposite in="fill" operator="in" result="fill-area" />
                  <feMerge>
                    <feMergeNode in="fill-area" />
                  </feMerge>
                </filter>
                <filter id="f1" x="0" y="0" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.2" />
                </filter>
              </defs>
              <g filter="url(#sand) url(#displacementFilter) url(#f1)">
                <path d={islandPath} strokeWidth="0.5rem" fill="url(#color)">
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
              <g  key="grid-object">
                <g style={{
                  transform: 'translate(15px, 15px)'
                }} ref={overlay}>
                  <Grid
                    game={game}
                    scale={7 / game.scale}
                    bg="rgba(0, 0, 0, 0.2)"
                    isOverlay={false}
                    mouseMove={(e) => {
                      if (overlay.current && svg) {
                        const rect = svg.getBoundingClientRect()
                        const innerPoint = svg.createSVGPoint()
                        const outerPoint = svg.createSVGPoint()

                        innerPoint.x = outerPoint.x = e.clientX
                        innerPoint.y = outerPoint.y = e.clientY

                        setMousePosition([innerPoint.x, innerPoint.y])

                        // innerPoint.matrixTransform(svg.getScreenCTM()!)

                        //setMousePosition([innerPoint.x / 6, innerPoint.y / 6])

                        // const fov = fieldOfView(
                        //   3,
                        //   [outerPoint.x, outerPoint.y],
                        //   6
                        // )

                        setOverlayTranslation([
                          outerPoint.x,
                          outerPoint.y,
                        ])
                      }
                    }}
                    mouseLeave={() => {
                      setMousePosition(null)
                      setOverlayTranslation(null)
                    }}
                  />
                </g>
              </g>
            </svg>
            {overlayTranslation && <canvas
              style={{
                position: 'absolute',
                transform: 'translateZ(3px)',
                pointerEvents: 'none',
                clipPath: 'url(#mag)',
                top: 0,
                left: 0,
              }}
              ref={setCanvas}
              height={size}
              width={size}
            />}
            <form>
              <label>
                <span>Island Size</span>
                <input
                  type="number"
                  min="7"
                  max="30"
                  step="1"
                  value={game.scale}
                  onChange={(e) => (game.scale = e.target.valueAsNumber)}
                />
              </label>
            </form>
          </div>
        )
      }}
    </AutoSizer>
  )
}
