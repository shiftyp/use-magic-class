import 'reflect-metadata'

const stateMetadataKey = Symbol()
const stateCollectionMetadataKey = Symbol()
const effectMetadataKey = Symbol()
const layoutEffectMetadataKey = Symbol()
const contextMetadataKey = Symbol()
const memoMetadataKey = Symbol()
const magicMetadataKey = Symbol()
const magicKey = Symbol()

interface Context<
  T,
  ProviderProps = { props: { value: T; children: any } },
  ConsumerProps = { children: (value: T) => any }
> {
  Provider:
    | ((props: { value: T; children: any }) => any)
    | {
        new (props: ProviderProps): { props: ProviderProps }
      }
  Consumer:
    | ((props: ConsumerProps) => any)
    | {
        new (props: ConsumerProps): { props: ConsumerProps }
      }
}

type Constructor<T = any> =
  | {
      new (): T
    }
  | {
      (): T
    }
  | T

type MagicObject<T> = T & {
  [magicKey]: {
    state: Partial<T>[]
    store: Partial<T>
  }
}

export const isState = Reflect.metadata(stateMetadataKey, true)

const getIsState = (target: any, propertyKey: string) => {
  return !!Reflect.getMetadata(stateMetadataKey, target, propertyKey)
}

export const isStateCollection = Reflect.metadata(stateCollectionMetadataKey, true)

const getIsStateCollection = (target: any, propertyKey: string) => {
  return !!Reflect.getMetadata(stateCollectionMetadataKey, target, propertyKey)
}

export const isEffect = <Target extends Object>(
  dependencies: any[] | ((target: Target) => any[] | void) = () => {}
) => Reflect.metadata(effectMetadataKey, dependencies)

const getIsEffect = (target: any, propertyKey: string) => {
  return Reflect.getMetadata(effectMetadataKey, target, propertyKey)
}

export const isLayoutEffect = <Target extends Object>(
  dependencies: any[] | ((target: Target) => any[] | void) = () => {}
) => Reflect.metadata(layoutEffectMetadataKey, dependencies)

const getIsLayoutEffect = (target: any, propertyKey: string) => {
  return Reflect.getMetadata(layoutEffectMetadataKey, target, propertyKey)
}

export const isMemo = <Target extends Object>(
  dependencies: any[] | ((target: Target) => any[] | void) = () => {}
) => Reflect.metadata(memoMetadataKey, dependencies)

const getIsMemo = (target: any, propertyKey: string) => {
  return Reflect.getMetadata(memoMetadataKey, target, propertyKey)
}

export const isContext = <T, U = T>(
  context: Context<T>,
  transform: (value: T) => U = (value) => value as unknown as U
) => Reflect.metadata(contextMetadataKey, [context, transform])

const getIsContext = (target: any, propertyKey: string) => {
  return Reflect.getMetadata(contextMetadataKey, target, propertyKey)
}

export const isMagic = Reflect.metadata(magicMetadataKey, true)

const getIsMagic = (target: any, propertyKey: string) => {
  return Reflect.getMetadata(magicMetadataKey, target, propertyKey)
}

export const createUseMagicClass = ({
  useEffect,
  useLayoutEffect,
  useState,
  useContext,
  useMemo,
}: {
  useEffect: (
    cb: () => void | (() => void),
    dependencies: any[] | undefined
  ) => void
  useLayoutEffect: (
    cb: () => void | (() => void),
    dependencies: any[] | undefined
  ) => void
  useState: <T>(initial: T) => [T, (value: T) => void]
  useContext: <T>(context: Context<T>) => T
  useMemo: <T>(cb: () => T, dependencies: any[]) => T
}) => {
  const useMagicClass = <Obj extends Object>(Constructor: Constructor<Obj>) => {
    const ignoreChanges = typeof Constructor === 'function'
    const memoDeps = [ignoreChanges ? true : Constructor]
    let inEffectPhase = false
    let inMemoPhase = false

    const [
      obj,
      magic,
      states,
      stateCollections,
      effects,
      layoutEffects,
      memos,
      contexts,
      magicState,
    ] = useMemo(() => {
      let obj = {} as MagicObject<Obj>

      if (typeof Constructor === 'function') {
        try {
          // @ts-ignore
          obj = new Constructor()
        } catch {
          // @ts-ignore
          obj = Constructor()
        }
      } else {
        obj = Constructor as MagicObject<Obj>
      }

      const magicState: Partial<Obj> = {}

      obj[magicKey] = obj[magicKey]
        ? {
            ...obj[magicKey],
            state: [...obj[magicKey].state, magicState],
          }
        : {
            store: {},
            state: [magicState],
          }

      const store = obj[magicKey].store

      const keys: Record<string, Object> = {}

      let target = obj

      do {
        Object.getOwnPropertyNames(target).forEach((key) => {
          if (!keys.hasOwnProperty(key)) {
            keys[key] = target
          }
        })

        target = Object.getPrototypeOf(target)
      } while (target !== Object.prototype)

      const magic: [(obj: any) => void, string][] = []
      const states: [
        (setState: (value: any) => void) => void,
        string
      ][] = []
      const stateCollections: [
        (setState: (value: any) => void) => void,
        string
      ][] = []
      const effects: [any[] | (() => any[] | void), string][] = []
      const layoutEffects: [any[] | (() => any[] | void), string][] = []
      const contexts: [
        Context<any>,
        undefined | ((value: any) => any),
        string
      ][] = []
      const memos: [any[] | (() => any[] | void), string][] = []

      Object.keys(keys).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(keys[key], key)!

        const contextInfo = getIsContext(obj, key)

        if (contextInfo) {
          const [context, transform] = contextInfo
          contexts.push([context, transform, key])
        }

        const effectDependency = getIsEffect(obj, key)

        if (effectDependency) {
          effects.push(
            // @ts-ignore
            [effectDependency, key]
          )
        }

        const layoutEffectDependency = getIsLayoutEffect(obj, key)

        if (layoutEffectDependency) {
          layoutEffects.push(
            // @ts-ignore
            [layoutEffectDependency, key]
          )
        }

        const memoDependency = getIsMemo(obj, key)

        if (memoDependency) {
          // @ts-ignore
          const get = descriptor.get.bind(obj)

          memos.push([memoDependency, key])

          Object.defineProperty(obj, key, {
            configurable: true,
            // @ts-ignore
            set: (val) => (store[key] = val),
            // @ts-ignore
            get: (() => {
              let runOnce = false

              return () => {
                if (inMemoPhase && !runOnce) {
                  // @ts-ignore
                  store[key] = get()
                  runOnce = true
                  setTimeout(() => (runOnce = false))
                }
                // @ts-ignore
                return store[key]
              }
            })(),
          })
        } else if (getIsMagic(obj, key)) {
          Object.defineProperty(obj, key, {
            configurable: true,
            get: () => store[key as keyof Obj],
            set: (value) => (store[key as keyof Obj] = value),
          })

          magic.push([
            (newTargetObj) => (store[key as keyof Obj] = newTargetObj),
            key,
          ])
        } else if (getIsStateCollection(obj, key)) {
          stateCollections.push([(setState) => {
            let collection = obj[key as keyof Obj] as Object
            const doUpdate = () => setState(Object.entries(collection))
            // @ts-ignore
            const createProxy = (value) => store[key as keyof Obj] = new Proxy(value, {
              get: Reflect.get,
              set: (...args) => {
                const ret = Reflect.set(...args)
                doUpdate()
                return ret
              },
              deleteProperty: (...args) => {
                const ret = Reflect.deleteProperty(...args)
                doUpdate()
                return ret
              },
              // @ts-ignore
              enumerate: Reflect.enumerate,
              ownKeys: Reflect.ownKeys,
            }) as Obj[keyof Obj]

            createProxy(collection)

            Object.defineProperty(obj, key, {
              get: () => store[key as keyof Obj],
              set: (value: any) => {
                collection = value
                createProxy(value)
                doUpdate()
              }
            })
          }, key])
        } else if (getIsState(obj, key)) {
          store[key as keyof Obj] = obj[key as keyof Obj]

          Object.defineProperty(obj, key, {
            configurable: true,
            // @ts-ignore
            get: () => store[key],
            set: (value) => {
              // @ts-ignore
              store[key] = value
              obj[magicKey].state.forEach(
                // @ts-ignore
                (magicState) => (magicState[key] = value)
              )
            },
          })

          states.push([
            (setState) => {
              Object.defineProperty(magicState, key, {
                // @ts-ignore
                set: (val) => {
                  setState(val)
                },
              })
            },
            key,
          ])
        }
      })

      return [
        obj,
        magic,
        states,
        stateCollections,
        effects,
        layoutEffects,
        memos,
        contexts,
        magicState,
      ] as const
      /* eslint-disable */
    }, [...memoDeps])
    /* eslint-enable */

    useEffect(
      () => () =>
        obj[magicKey].state.splice(obj[magicKey].state.indexOf(magicState), 1),
      []
    )

    magic.forEach(([init, key]) => {
      /* eslint-disable */
      // @ts-ignore
      const magicObj = useMagicClass(obj[key])
      // @ts-ignore
      useMemo(() => init(magicObj), [obj[key]])
      /* eslint-enable */
    })

    states.forEach(([init, key]) => {
      /* eslint-disable */
      // @ts-ignore
      const [_, setState] = useState(() => obj[key])
      useEffect(() => {
        setState(() => obj[key as keyof Obj])
      }, [memoDeps])
      useMemo(() => init(setState), [...memoDeps])
      /* eslint-enable */
    })

    stateCollections.forEach(([init, key]) => {
      /* eslint-disable */
      const [_, setState] = useState(null)
      useMemo(() => init(setState), [...memoDeps])
      /* eslint-enable */
    })

    contexts.forEach(([context, transform, key]) => {
      /* eslint-disable */
      // @ts-ignore
      const value = useContext(context)
      // @ts-ignore
      obj[key] = useMemo(
        () => (typeof transform === 'function' ? transform(value) : value),
        [value]
      )
      /* eslint-enable */
    })

    // @ts-ignore
    useMemo(() => {
      inMemoPhase = true
    })

    memos.forEach(([dependencies, key]) => {
      /* eslint-disable */
      //@ts-ignore
      useMemo(
        // @ts-ignore
        () => (obj[key] = obj[key]),
        // @ts-ignore
        dependencies && [
          // @ts-ignore
          ...(Array.isArray(dependencies) ? dependencies : dependencies(obj)),
          ...memoDeps,
        ]
        /* eslint-enable */
      )
    })

    // @ts-ignore
    useMemo(() => {
      inMemoPhase = false
    })

    // @ts-ignore
    useEffect(() => {
      inEffectPhase = true
    })

    effects.forEach(([dependencies, key]) => {
      /* eslint-disable */
      useEffect(
        () => {
          // @ts-ignore
          const ret = obj[key as keyof Obj].bind(obj)()
          if (typeof ret === 'function') {
            return ret
          }
        },
        // @ts-ignore
        dependencies && Array.isArray(dependencies)
          ? dependencies
          : // @ts-ignore
            dependencies(obj)
        /* eslint-enable */
      )
    })

    layoutEffects.forEach(([dependencies, key]) => {
      /* eslint-disable */
      useLayoutEffect(
        () => {
          // @ts-ignore
          const ret = obj[key as keyof Obj].bind(obj)()
          if (typeof ret === 'function') {
            return ret
          }
        },
        // @ts-ignore
        dependencies && Array.isArray(dependencies)
          ? dependencies
          : // @ts-ignore
            dependencies(obj)
        /* eslint-enable */
      )
    })

    // @ts-ignore
    useEffect(() => {
      inEffectPhase = false
    })

    return obj
  }

  return useMagicClass
}
