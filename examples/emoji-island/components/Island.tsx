import React, { useCallback, useMemo, useRef, useState } from 'react'

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
    []
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
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: -1,
                  overflow: 'hidden',
                }}
                viewBox={`0 0 ${width} ${height}`}
                height={height}
                width={width}
              >
                <defs>
                  <filter id="f3">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                  </filter>

                  <filter
                    id="shelfFilter"
                    colorInterpolationFilters="sRGB"
                  >
                    <feTurbulence
                      type="turbulence"
                      baseFrequency={turbulenceFreq}
                      numOctaves="2"
                      result="turbulence"
                    />
                    <feDisplacementMap
                      in2="turbulence"
                      in="SourceGraphic"
                      scale="10"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                  <pattern
                    id="whitecaps2"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(65)"
                  >
                    <filter id="f2" x="0" y="0" width="20" height="20">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                      <feOffset dx="7" result="shadow" />
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="1"
                        scale={0.1}
                        result="noise"
                      />

                      <feMorphology
                        in="SourceAlpha"
                        in2="luminance"
                        operator="dilate"
                        radius="4"
                        result="fill"
                      />
                      <feColorMatrix
                        in="fill"
                        type="luminanceToAlpha"
                        result="gray"
                      />

                      <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation="1"
                        result="blur"
                      />
                      <feBlend
                        in="blur"
                        in2="gray"
                        mode="divide"
                        result="graphic"
                      />
                      <feComponentTransfer in="graphic" result="gamma">
                        <feFuncG type="linear" slope="1.0" intercept="0.1" />
                        <feFuncB type="linear" slope="1.0" intercept="0.1" />
                        <feFuncR type="linear" slope="1.0" intercept="0.1" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode in="shadow" />
                        <feMergeNode in="gamma" />
                      </feMerge>
                    </filter>
                    <rect
                      filter="url(#f2)"
                      fill="rgb(153, 248, 263)"
                      strokeWidth="2px"
                      x="7"
                      width="2"
                      y="0"
                      height="3"
                    ></rect>
                    <rect
                      filter="url(#f2)"
                      fill="rgb(153, 248, 263)"
                      strokeWidth="2px"
                      x="5"
                      width="6"
                      y="10"
                      height="2"
                    ></rect>
                    <rect
                      filter="url(#f2)"
                      fill="rgb(153, 248, 263)"
                      strokeWidth="2px"
                      x="10"
                      width="3"
                      y="14"
                      height="4"
                    ></rect>
                    {game.showWaves && <animate
                      attributeName="x"
                      values="0;20"
                      repeatCount="indefinite"
                      dur="10s"
                    />}
                  </pattern>
                  <filter id="whitecaps-turbulence">
                    <feTurbulence
                      type="turbulence"
                      baseFrequency={turbulenceFreq * 0.5 + 0.01}
                      numOctaves="3"
                    ></feTurbulence>
                    <feDisplacementMap
                      in2="turbulence"
                      in="SourceGraphic"
                      scale={30}
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                  <radialGradient id="ocean" cx={0.5} cy={0.5} r={0.5}>
                    <stop
                      offset="0%"
                      stopOpacity={1}
                      stopColor="rgb(245, 228, 172)"
                    />
                    <stop
                      offset="80%"
                      stopOpacity={0.5}
                      stopColor="rgb(245, 228, 172)"
                    />
                    <stop
                      offset="97%"
                      stopOpacity={0.2}
                      stopColor="rgb(128, 127, 121)"
                    />
                    <stop
                      offset="100%"
                      stopOpacity={0}
                      stopColor="rgb(46, 160, 212)"
                    />
                  </radialGradient>
                  <filter id="waves" colorInterpolationFilters="sRGB">
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
                      baseFrequency={turbulenceFreq / 2}
                      numOctaves="12"
                      result="turbulence"
                    ></feTurbulence>
                    <feColorMatrix
                      in="turbulence"
                      type="saturate"
                      values="0"
                      result="luminance"
                    />
                    <feBlend
                      in="SourceGraphic"
                      in2="saturation"
                      mode="overlay"
                      result="sand"
                    />
                    <feBlend
                      in="SourceGraphic"
                      in2="luminance"
                      mode="overlay"
                      result="dunes"
                    />
                    <feBlend in="dunes" in2="sand" mode="normal" />
                  </filter>
                </defs>
                <rect
                  filter="url(#waves)"
                  fill="rgb(46, 160, 212)"
                  x={0}
                  y={0}
                  height={height}
                  width={width}
                ></rect>

                <rect
                  filter="url(#whitecaps-turbulence)"
                  fill="url(#whitecaps2)"
                  x={0}
                  y={0}
                  height={height}
                  width={width}
                ></rect>

                <rect
                  filter="url(#f3) url(#shelfFilter)"
                  transform="translate(-25, -25)"
                  fill="url(#ocean)"
                  height={size}
                  width={size}
                  x={(width - size) / 2}
                  y={(height - size) / 2}
                ></rect>
              </svg>
              <svg
                ref={setSvg}
                id="island"
                className="island"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 300 300"
                height={size}
                width={size}
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
                    <stop offset="0%" stopColor="rgb(10, 120, 110)" />
                    <stop offset="70%" stopColor="rgb(10, 120, 110)" />
                    <stop offset="99%" stopColor="rgb(245, 228, 172)" />
                  </radialGradient>
                  <filter
                    id="displacementFilter"
                    colorInterpolationFilters="sRGB"
                  >
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
                  <filter id="sand" colorInterpolationFilters="sRGB">
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
                      type="saturate"
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
                      mode="overlay"
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
                    <feComposite in="fill" operator="in" />
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
                      1rem;
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
                <foreignObject x="140" y="250" width={250} height="200">
                  <form
                    style={{
                      fontSize: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      transform: 'translate(-50%, 0)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <svg style={{
                      flexShrink: 0,
                    }} height="1.5rem" width="3rem" viewBox='0 0 32 64'><use xlinkHref='#E243'></use></svg>
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
                      onTouchStart={() => {
                        game.clearEntities()

                        const handler = () => {
                          game.makeEntities()
                          window.removeEventListener('touchend', handler)
                        }

                        window.addEventListener('touchend', handler)
                      }}
                      onChange={(e) => {
                        game.scale = e.target.valueAsNumber
                      }}
                      style={{
                        fontSize: '0.25rem',
                        display: 'inline-block',
                        width: 200,
                      }}
                    />
                     <svg style={{
                      flexShrink: 0,
                    }} height="1.5rem" width="1.5rem" viewBox='20 0 32 72'><use xlinkHref="#2601"></use></svg>
                    <input
                      type="checkbox"
                      title='Show Clouds'
                      checked={game.showClouds}
                      onClick={(e) =>
                        game.showClouds = (e.target as HTMLInputElement).checked
                      }
                    />
                    <svg style={{
                      flexShrink: 0,
                    }} height="1.5rem" width="1.5rem" viewBox='20 0 32 72'><use xlinkHref="#1F30A"></use></svg>
                    <input
                      type="checkbox"
                      title='Show Waves'
                      checked={game.showWaves}
                      onClick={(e) =>
                        game.showWaves = (e.target as HTMLInputElement).checked
                      }
                    />
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

              {game.showClouds && <svg
                style={{
                  position: 'absolute',
                  top: -50,
                  left: -50,
                  zIndex: 0,
                  overflow: 'hidden',
                  pointerEvents: 'none',
                }}
                viewBox={`0 0 ${width} ${height}`}
                height={height + 100}
                width={width + 100}
              >
                <defs>
                  <filter id="f5">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
                  </filter>
                  <pattern
                    id="clouds"
                    width="2000"
                    height="2000"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(65)"
                  >
                    <filter id="f4" x="0" y="0" width="20" height="20">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="100" />
                      <feOffset dx="70" dy="70" result="shadow" />
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="1"
                        scale={0.1}
                        result="noise"
                      />
                      <feComponentTransfer in="shadow" result="shadow-alpha">
                        <feFuncA type="linear" slope="1 " intercept="0" />
                      </feComponentTransfer>
                      <feMorphology
                        in="SourceAlpha"
                        in2="luminance"
                        result="fill"
                      />
                      <feColorMatrix
                        in="fill"
                        type="luminanceToAlpha"
                        result="gray"
                      />

                      <feGaussianBlur
                        in="SourceGraphic"
                        stdDeviation="35"
                        result="blur"
                      />
                      <feBlend
                        in="blur"
                        in2="gray"
                        mode="divide"
                        result="graphic"
                      />
                      <feComponentTransfer in="graphic" result="gamma">
                        <feFuncR type="linear" slope="1.0" intercept="0.0" />
                        <feFuncG type="linear" slope="1.0" intercept="0.1" />
                        <feFuncB type="linear" slope="1.0" intercept="0.1" />
                        <feFuncR type="linear" slope="1.0" intercept="0.1" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode in="shadow-alpha" />
                        <feMergeNode in="gamma" />
                      </feMerge>
                    </filter>
                    <rect
                      filter="url(#f4)"
                      fill="rgb(255, 255, 255)"
                      strokeWidth="2px"
                      x="1000"
                      width="100"
                      y="400"
                      height="300"
                      rx={100}
                      ry={100}
                    ></rect>
                    <rect
                      filter="url(#f4)"
                      fill="rgb(255, 255, 255)"
                      strokeWidth="2px"
                      x="700"
                      width="150"
                      height="400"
                      y="1500"
                      rx={100}
                      ry={100}
                    ></rect>
                    <rect
                      filter="url(#f4)"
                      fill="rgb(255, 255, 255)"
                      strokeWidth="2px"
                      x="1700"
                      width="100"
                      y="100"
                      height="100"
                      rx={100}
                      ry={100}
                    ></rect>
                    <rect
                      filter="url(#f4)"
                      fill="rgb(255, 255, 255)"
                      strokeWidth="2px"
                      x="800"
                      width="200"
                      y="40"
                      height="150"
                      rx={100}
                      ry={100}
                    ></rect>
                    <rect
                      filter="url(#f4)"
                      fill="rgb(255, 255, 255)"
                      strokeWidth="2px"
                      x="200"
                      width="150"
                      height="100"
                      y="1900"
                      rx={100}
                      ry={100}
                    ></rect>
                    <rect
                      filter="url(#f4)"
                      fill="rgb(255, 255, 255)"
                      strokeWidth="2px"
                      x="100"
                      width="100"
                      y="100"
                      height="300"
                      rx={100}
                      ry={100}
                    ></rect>
                    <rect
                      filter="url(#f4)"
                      fill="rgb(255, 255, 255)"
                      strokeWidth="2px"
                      x="500"
                      width="200"
                      y="400"
                      height="500"
                      rx={100}
                      ry={100}
                    ></rect>
                    <rect
                      filter="url(#f4)"
                      fill="rgb(255, 255, 255)"
                      strokeWidth="2px"
                      x="200"
                      width="150"
                      height="100"
                      y="200"
                      rx={100}
                      ry={100}
                    ></rect>
                    <rect
                      filter="url(#f4)"
                      fill="rgb(255, 255, 255)"
                      strokeWidth="2px"
                      x="100"
                      width="100"
                      y="100"
                      height="100"
                      rx={100}
                      ry={100}
                    ></rect>
                    <animate
                      attributeName="x"
                      values="0;2000"
                      repeatCount="indefinite"
                      dur="100s"
                    />
                  </pattern>
                  <filter id="cloud-turbulence">
                    <feTurbulence
                      type="turbulence"
                      baseFrequency={0.02}
                      numOctaves="12"
                    ></feTurbulence>
                    <feDisplacementMap
                      in2="turbulence"
                      in="SourceGraphic"
                      scale={150}
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                </defs>

                <rect
                  filter="url(#f5) url(#cloud-turbulence)"
                  fill="url(#clouds)"
                  x={0}
                  y={0}
                  height={height}
                  width={width}
                ></rect>
              </svg>}
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
                      transform: 'translate(-110px, -110px)',
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
                    transform: 'translate(-110px, -110px)',
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
                      (e.clientX - gridRect!.x + 110) /
                        (gridRect!.width / game.scale)
                    )
                    const y = Math.floor(
                      (e.clientY - gridRect!.y + 110) /
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
