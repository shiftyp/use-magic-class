import { isEffect, isState } from 'use-magic-class'
import { Entities, Entity, Space } from './entities'

const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}
export class Game {
  @isState
  public scale = 7

  @isState
  showClouds = true

  @isState
  showWaves = true

  public clearEntities() {
    this.ctors = new Map()
    this.entities = []
    this.entitiesSet = new Set()
  }

  @isEffect([true])
  public makeEntities() {
    this.entitiesSet.clear()
    this.ctors.clear()

    const entities = []

    const choices: { new (): Entity }[] = []

    Object.values(Entities).forEach((ctor) => {
      const ctorEntities: Entity[] = []

      for (let i = 0; i < this.scale ** 2; i++) {
        const entity = new ctor()
        entity.position = [-1, -1]

        ctorEntities.push(entity)
      }

      this.ctors.set(ctor, ctorEntities)

      for (let i = 0; i < ctor.weight; i++) {
        choices.push(ctor)
      }
    })

    for (const entity of Array.from(this.ctors.values()).reduce(
      (all, entities) => [...all, ...entities],
      []
    )) {
      this.entitiesSet.add(entity)
    }

    for (let i = 0; i < this.scale ** 2; i++) {
      const entity = this.newEntity(pickRandom(choices))
      entity.position = [i % this.scale, Math.floor(i / this.scale)]
      entities[i] = entity
    }

    this.entities = entities
  }

  @isState
  private ctors = new Map<{ new (): Entity }, Entity[]>()

  @isState
  private entities: Entity[] = []

  @isState
  private entitiesSet = new Set<Entity>()

  lastActed = new WeakMap<Entity, number>()

  public peek(entity: Entity) {
    const index = this.entities.indexOf(entity)

    const col = index % this.scale
    const row = Math.floor(index / this.scale)

    const firstCol = col === 0
    const lastCol = col === this.scale - 1
    const firstRow = row === 0
    const lastRow = row === this.scale - 1

    const checks = [
      !firstRow && !firstCol && index - this.scale - 1,
      !firstRow && index - this.scale,
      !firstRow && !lastCol && index - this.scale + 1,
      !firstCol && index - 1,
      !lastCol && index + 1,
      !lastRow && !firstCol && index + this.scale - 1,
      !lastRow && index + this.scale,
      !lastRow && !lastCol && index / this.scale < 1 && index + this.scale + 1,
    ].filter<number>((check): check is number => check !== false)

    return checks.map((checkIndex) => this.entities[checkIndex])
  }

  public peekRandom(entity: Entity, ...ctors: { new (): Entity }[]) {
    let entities = this.peek(entity)

    if (ctors.length) {
      entities = entities.filter((entity) =>
        ctors.find((ctor) => entity.is(ctor))
      )
    }

    if (!entities.length) {
      return null
    }

    return pickRandom(entities)
  }

  public replace(a: Entity, b: Entity | { new (): Entity }) {
    const bIndex = typeof b === 'function' ? -1 : this.entities.indexOf(b)
    const aIndex = this.entities.indexOf(a)

    const bEntity = typeof b === 'function' ? this.newEntity(b) : b

    if (bIndex >= 0) {
      const space = this.newEntity(Space)
      space.position = bEntity.position
      this.entities.splice(bIndex, 1, space)
    }

    this.entities.splice(aIndex, 1, bEntity)

    bEntity.position = a.position
    a.position = [-1, -1]
    this.ctors.get(a.constructor as { new (): Entity })?.push(a)
    this.lastActed.delete(a)
  }

  public newEntity<T extends Entity>(ctor?: { new (): T }): T {
    const ctorEntities = ctor
      ? this.ctors.get(ctor)!
      : this.ctors.get(pickRandom(Array.from(this.ctors.keys())))!
    const [entity] = ctorEntities.splice(
      Math.floor(Math.random() * ctorEntities.length),
      1
    )
    return entity as T
  }

  public map<T>(cb: (entity: Entity) => T): T[] {
    let ret: T[] = []
    this.entitiesSet.forEach((entity) => ret.push(cb(entity)))

    return ret
  }

  public interactAt(x: number, y: number) {
    this.entities[y * this.scale + x].interact()
  }

  @isEffect<Game>(({ entities }) => [entities])
  private doActions() {
    let lastTime = performance.now()
    let lastPerfTime = performance.now()
    let perfDiffs: number[] = []

    let frame: number | null = null

    const testFramerate = () => {
      const now = performance.now()
      const diff = now - lastPerfTime
      lastPerfTime = now

      perfDiffs.push(diff)

      if (perfDiffs.length > 10) {
        perfDiffs.shift()
      }

      const dropped = perfDiffs.filter((diff) => diff > 1000 / 2)

      if (dropped.length > 5) {
        console.log(perfDiffs)
        this.showWaves = false
        this.showClouds = false
        perfDiffs = []
      } else {
        frame = window.requestAnimationFrame(testFramerate)
      }
    }

    frame = window.requestAnimationFrame(testFramerate)

    const interval = setInterval(() => {
      window.requestAnimationFrame(() => {
        const time = performance.now()
        const diff = time - lastTime

        lastTime = time

        this.entities.forEach((entity) => {
          const lastActed = this.lastActed.get(entity)

          if (lastActed !== undefined && lastActed + diff > entity.speed) {
            entity.act()
            this.lastActed.set(entity, 0)
          } else {
            this.lastActed.set(
              entity,
              lastActed === undefined ? 0 : lastActed + diff
            )
          }
        })
      })
    }, 100)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      if (interval) clearInterval(interval)
    }
  }
}
