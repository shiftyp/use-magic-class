import * as sinon from 'sinon'
import * as magic from '../useMagicClass'
import { useLayoutEffect } from 'preact/hooks';

const TestContext = {}

class TestClass1 {
  @magic.isState
  testState1 = 1

  @magic.isState
  testState2 = 'string'

  @magic.isLayoutEffect([1, 2, 3])
  testLayoutEffect1() {}

  @magic.isLayoutEffect((obj) => [obj])
  testLayoutEffect2() {}

  @magic.isEffect([1, 2, 3])
  testEffect1() {}

  @magic.isEffect((obj) => [obj])
  testEffect2() {}

  // @ts-ignore
  @magic.isContext(TestContext)
  testContext = null 
}

const contextValue = Symbol()
const stateValue = Symbol()

describe('useMagicClass', () => {
  let useMagicClass: ReturnType<typeof magic.createUseMagicClass>
  let hooks: Parameters<typeof magic.createUseMagicClass>[0]

  beforeEach(() => {
    hooks = {
      // @ts-ignore
      useState: sinon.stub((value) => [stateValue, () => {}]),
      useMemo: sinon.stub((cb) => cb()),
      // @ts-ignore
      useContext: sinon.stub((context) => contextValue),
      useEffect: sinon.stub((cb, dependencies) => {}),
      useLayoutEffect: sinon.stub((cb, dependencies) => {}),
    }
    useMagicClass = magic.createUseMagicClass(hooks);
  });

  it('should call all hooks', () => {
    const instance = useMagicClass(TestClass1)
  })
})