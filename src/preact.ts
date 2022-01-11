import Preact from 'preact/compat'
import { createUseMagicClass}  from './useMagicClass'
export { isState, isEffect, isLayoutEffect, isContext, isMagic, isMemo } from './useMagicClass'

// @ts-ignore
export const useMagicClass = createUseMagicClass(Preact)