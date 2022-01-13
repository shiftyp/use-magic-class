import * as magic from '../src/useMagicClass'

const TestContext = Symbol()
const contextValue = Symbol()
const effectDependency = Symbol()
const stateValue = Symbol()
const memoValue = Symbol()
const memoDependency = Symbol()

class StateClass {
  @magic.isState
  testState1 = 1

  @magic.isState
  testState2 = 'string'
}

class LayoutEffectClass {
  static fixedDependencies = [1, 2, 3]
  static dependencyCallback = jest.fn((obj: any) => [effectDependency])

  @magic.isLayoutEffect(LayoutEffectClass.fixedDependencies)
  testLayoutEffect1() {}

  @magic.isLayoutEffect(LayoutEffectClass.dependencyCallback)
  testLayoutEffect2() {}

  @magic.isLayoutEffect()
  testLayoutEffect3() {}
}

class EffectClass {
  static fixedDependencies = [1, 2, 3]
  static dependencyCallback = jest.fn((obj: any) => [effectDependency])

  @magic.isEffect(EffectClass.fixedDependencies)
  testEffect1() {}

  @magic.isEffect(EffectClass.dependencyCallback)
  testEffect2() {}

  @magic.isEffect()
  testEffect3() {}
}

class ContextClass {
  static transformCallback = jest.fn((obj: any) => obj)
  // @ts-ignore
  @magic.isContext(TestContext)
  testContext1 = null

  // @ts-ignore
  @magic.isContext(TestContext, ContextClass.transformCallback)
  testContext2 = null
}

class MemoClass {
  
  static memoCallback = jest.fn(() => memoValue)
  static dependencyCallback = jest.fn((obj: any) => [memoDependency])
  static fixedDependencies = [memoDependency]

  @magic.isMemo(MemoClass.fixedDependencies)
  get memoValue1() {
    return MemoClass.memoCallback()
  }

  @magic.isMemo(MemoClass.dependencyCallback)
  get memoValue2() {
    return MemoClass.memoCallback()
  }

  @magic.isMemo()
  get memoValue3() {
    return MemoClass.memoCallback()
  }
}

class InnerMagicClass {

}

class OuterMagicClass {
  @magic.isMagic
  inner = new InnerMagicClass()
}


describe('useMagicClass', () => {
  let useMagicClass: ReturnType<typeof magic.createUseMagicClass>
  let hooks: Parameters<typeof magic.createUseMagicClass>[0]
  let setState: (value: any) => void

  beforeEach(() => {
    setState = jest.fn()

    hooks = {
      // @ts-ignore
      useState: jest.fn((cb: () => any) => [cb(), setState]),
      useMemo: jest.fn((cb) => cb()),
      // @ts-ignore
      useContext: jest.fn(() => contextValue),
      useEffect: jest.fn(),
      useLayoutEffect: jest.fn(),
    }
    useMagicClass = magic.createUseMagicClass(hooks)
  })

  it('should call state hooks', () => {
    const instance = useMagicClass(StateClass)

    expect(instance.testState1).toBe(1)
    expect(instance.testState2).toBe('string')

    expect(hooks.useState).toHaveBeenCalledTimes(2)

    // @ts-ignore
    expect(
      (hooks.useState as jest.MockedFn<any>).mock.results[0].value[0]
    ).toBe(1)
    // @ts-ignore
    expect(
      (hooks.useState as jest.MockedFn<any>).mock.results[1].value[0]
    ).toBe('string')

    // @ts-ignore
    instance.testState1 = stateValue

    expect(instance.testState1).toBe(stateValue)

    expect(setState).toHaveBeenCalledWith(stateValue)
  })

  it('should call context hooks', () => {
    const instance = useMagicClass(ContextClass)

    expect(hooks.useContext).toHaveBeenCalledTimes(2)

    expect(instance.testContext1).toBe(contextValue)
    expect(instance.testContext2).toBe(contextValue)

    expect(ContextClass.transformCallback).toHaveBeenCalledWith(contextValue)
  })

  it('should call effect hooks', () => {
    const instance = useMagicClass(EffectClass)

    expect(hooks.useEffect).toHaveBeenCalledTimes(3)

    expect((hooks.useEffect as jest.MockedFn<any>).mock.calls[0][1]).toBe(
      EffectClass.fixedDependencies
    )
    expect(
      (hooks.useEffect as jest.MockedFn<any>).mock.calls[1][1]
    ).toMatchObject([effectDependency])
    expect(
      (hooks.useEffect as jest.MockedFn<any>).mock.calls[2][1]
    ).toBeUndefined()

    expect(EffectClass.dependencyCallback.mock.calls[0][0]).toBe(instance)

    jest.spyOn(instance, 'testEffect1')
    jest.spyOn(instance, 'testEffect2')
    jest.spyOn(instance, 'testEffect3')

    // @ts-ignore
    ;(hooks.useEffect as jest.MockedFn<any>).mock.calls[0][0]()
    // @ts-ignore
    ;(hooks.useEffect as jest.MockedFn<any>).mock.calls[1][0]()
    // @ts-ignore
    ;(hooks.useEffect as jest.MockedFn<any>).mock.calls[2][0]()

    expect(instance.testEffect1).toHaveBeenCalledTimes(1)
    expect(instance.testEffect2).toHaveBeenCalledTimes(1)
    expect(instance.testEffect3).toHaveBeenCalledTimes(1)
  })

  it('should call layout effect hooks', () => {
    const instance = useMagicClass(LayoutEffectClass)

    expect(hooks.useLayoutEffect).toHaveBeenCalledTimes(3)

    expect((hooks.useLayoutEffect as jest.MockedFn<any>).mock.calls[0][1]).toBe(
      LayoutEffectClass.fixedDependencies
    )
    expect(
      (hooks.useLayoutEffect as jest.MockedFn<any>).mock.calls[1][1]
    ).toMatchObject([effectDependency])
    expect(
      (hooks.useLayoutEffect as jest.MockedFn<any>).mock.calls[2][1]
    ).toBeUndefined()

    expect(LayoutEffectClass.dependencyCallback.mock.calls[0][0]).toBe(instance)

    jest.spyOn(instance, 'testLayoutEffect1')
    jest.spyOn(instance, 'testLayoutEffect2')
    jest.spyOn(instance, 'testLayoutEffect3')

    // @ts-ignore
    ;(hooks.useLayoutEffect as jest.MockedFn<any>).mock.calls[0][0]()
    // @ts-ignore
    ;(hooks.useLayoutEffect as jest.MockedFn<any>).mock.calls[1][0]()
    // @ts-ignore
    ;(hooks.useLayoutEffect as jest.MockedFn<any>).mock.calls[2][0]()

    expect(instance.testLayoutEffect1).toHaveBeenCalledTimes(1)
    expect(instance.testLayoutEffect2).toHaveBeenCalledTimes(1)
    expect(instance.testLayoutEffect3).toHaveBeenCalledTimes(1)
  })

  it('should call memo hooks', () => {
    const instance = useMagicClass(MemoClass)

    expect(hooks.useMemo).toHaveBeenCalledTimes(3 + 1 /* for creating instance */)

    expect((hooks.useMemo as jest.MockedFn<any>).mock.calls[1][1]).toBe(
      MemoClass.fixedDependencies
    )
    expect(
      (hooks.useMemo as jest.MockedFn<any>).mock.calls[2][1]
    ).toMatchObject([memoDependency])
    expect(
      (hooks.useMemo as jest.MockedFn<any>).mock.calls[3][1]
    ).toBeUndefined()

    expect(MemoClass.dependencyCallback.mock.calls[0][0]).toBe(instance)

    expect(MemoClass.memoCallback).toHaveBeenCalledTimes(3)

    MemoClass.memoCallback.mockClear()

    expect(instance.memoValue1).toBe(memoValue)
    expect(instance.memoValue1).toBe(memoValue)
    expect(instance.memoValue1).toBe(memoValue)

    expect(MemoClass.memoCallback).toHaveBeenCalledTimes(0)
  })
  it('should call inner magic hooks', () => {
    const instance = useMagicClass(OuterMagicClass)

    expect(hooks.useMemo).toHaveBeenCalledTimes(2 + 1 /* for init */)

    expect((hooks.useMemo as jest.MockedFn<any>).mock.results[0].value[0]).toBe(instance)
    expect((hooks.useMemo as jest.MockedFn<any>).mock.results[1].value[0]).toBe(instance.inner)
  })
})
