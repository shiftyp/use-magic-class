import React, { useMemo } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'
import { Grid } from './Grid'

const islandPath =
  'm97.761463,-4.0381c18.427334,-1.280909 16.683508,25.048933 19.156094,40.586017c2.472602,15.537084 1.067116,48.949192 -6.715047,62.994304c-7.782163,14.045098 -21.941018,8.748924 -36.698514,14.150895c-14.783514,5.427692 -33.288932,-1.165823 -48.905324,-6.670693c-15.64241,-5.530578 -26.808122,1.770075 -34.980706,-11.812009c-8.172569,-13.607806 -12.050641,-42.482334 -8.615041,-58.096582c3.409582,-15.614248 2.420551,-35.301098 14.809547,-44.715954c12.388996,-9.414842 38.156036,-8.557705 54.058732,-8.892112c15.876663,-0.334407 29.46291,13.737044 47.89026,12.456134z'

export const Island = () => {
  const freq = useMemo(() => Math.random() * 0.05, [])
  return (
    <AutoSizer>
      {({ height, width }) => {
        const size = Math.min(height, width)
        return (
          <div
            className="island-outer"
            style={{
              height,
              width,
            }}
          >
            <svg
              id="island"
              className="island"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-25 -25 175 175"
              height={size}
              width={size}
            >
              <defs>
                <radialGradient id="color">
                  <stop offset="0%" stopColor="rgb(120, 200, 180)" />
                  <stop offset="70%" stopColor="rgb(120, 200, 180)" />
                  <stop offset="99%" stopColor="rgb(255, 238, 182)" />
                </radialGradient>
                <filter id="displacementFilter">
                  <feTurbulence
                    type="turbulence"
                    baseFrequency="0.04"
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
                    type="saturation"
                    values="0"
                    result="saturation"
                  />
                  <feTurbulence
                    type="turblence"
                    baseFrequency="0.04"
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
                  <feMorphology
                    in="SourceAlpha"
                    operator="erode"
                    radius="1.5rem"
                  />
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
              <Grid />
            </svg>
          </div>
        )
      }}
    </AutoSizer>
  )
}
