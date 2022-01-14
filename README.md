# useMagicClass

[![use-magic-class tests](https://github.com/shiftyp/use-magic-class/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/shiftyp/use-magic-class/actions/workflows/test.yml)

A hook and class decorators for composing custom react / preact hooks declaratively as class instances, rather than using a plain composed function. The goal is to provide an alternative and ergonomic classical machanism for constructing, composing, and extending custom hooks and their returned api's.

## Example

```tsx
import React from 'react'
import { isState, isEffect } from 'use-magic-object'
import { useMagicClass } from 'use-magic-object/react'

class MagicClass {
  @isState
  public statefulValue = 1

  @isEffect<MagicClass>(({ statefulValue }) => ( 
    [statefulValue]
  ))
  public logValue() {
    console.log(ths.statefulValue)
  }
}

const Component = () => {
  const magic = useMagicClass(MagicClass)

  return (
    <button onClick={() => {
      magic.statefulValue++
    }}>
      {magic.statefulValue}
    </button>
  )
```

## API Reference

### hook

#### **useMagicClass**

Creates an instance of a class decorated with the decorators in the following section. The decorators map to further hook calls internally, which are combined with the decorated properties / methods to create a composed hook api. See Example or the examples directory for usage.

### Decorators

#### **isState**

Decorates a stateful property, that when changed triggers a state update. Just like with setState, only properties that are not strictly equal will trigger an update. Internally maps to a `useState` call.

```typescript
import { isState } from 'use-magic-class'

class State {
  @isState
  public number = 1

  @isState
  private string = 'string'

  @isState
  protected boolean = false
}
```

#### **isEffect**

Decorates a method to indicate it should be called as an effect. Any dependencies are passed to the decorator either as an array, or as a function that returns an array, and takes the class instance as its argument. Internally maps to a `useEffect` call.

```typescript
import { isEffect } from 'use-magic-class'

class Effect {
  public number = 1

  @isEffect()
  public runEveryTime() {
    return () => { /* cleanup logic */ }
  }

  @isEffect([])
  private runOnce() {}

  @isEffect<Effect>((effect) => [effect.number])
  protected runWhenChanged() {}
}
```

#### **isLayoutEffect**

Decorates a method to indicate it should be called as an layout effect. Any dependencies are passed to the decorator either as an array, or as a function that returns an array, and takes the class instance as its argument. Internally maps to a `useLayoutEffect` call.

```typescript
import { isLayoutEffect } from 'use-magic-class'

class LayoutEffect {
  public number = 1

  @isLayoutEffect()
  public runEveryTime() {
    return () => { /* cleanup logic */ }
  }

  @isLayoutEffect([])
  private runOnce() {}

  @isLayoutEffect<LayoutEffect>((effect) => [effect.number])
  protected runWhenChanged() {}
}
```

#### **isContext**

Decorates a property to indicate that it should be populated and updated from context. Optionally takes a transform function which recieves the current context value as its argument. Maps internally to a `useContext` call.

```typescript
import createContext from 'react'
import { isContext } from 'use-magic-class'

const ObjectContext = createContext<{
  number: number
}>({number: 1 })

class Context {
  @isContext(ObjectContext)
  public object: { number: number } | null = null

  @isContext(ObjectContext, ({ object }) => object.number)
  private number: number | null = null
}
```

#### **isMemo**

Decorates a readonly computed property to indicate that its return value should be memoized. Any dependencies are passed to the decorator either as an array, or as a function that returns an array, and takes the class instance as its argument. Maps internally to a `useMemo` call.

```typescript
import { isState, isMemo } from 'use-magic-class'

class Memo {
  @isState
  private number: number = 1

  @isMemo<Memo>(({ number }) => [number])
  public get object: { number: number } () {
    return {
      number: this.number
    }
  }
}
```

#### **isMagic**

Decorates a nested magic class property. The property should be initialized as an instance of the magic class. Maps internally to a `useMagicClass` call.

```typescript
import { isState, isMagic } from 'use-magic-class'

class State {
  @isState
  private number: number = 1
}

class Composition {
  @isMagic
  public state = new State()
}
```

## Running Tests

This project utilizes `yarn` and yarn workspaces. To run tests, run from the root directory:

```bash
# once
yarn
# and each time
yarn workspace use-magic-class test
```


## License

[MIT](https://choosealicense.com/licenses/mit/)

