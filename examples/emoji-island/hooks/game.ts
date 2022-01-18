import { isEffect, isMemo, isState } from "use-magic-class";
import { Entities, Entity, EntityName, Space } from "./entities";

export class Game {
  @isState
  public scale = 7

  @isState
  private generation: number = 0

  @isMemo<Game>(({ scale }) => [scale])
  public get entities() {
    const ctors: (new () => Entity)[] = []
    const entities: Entity[] = []

    Object.values(Entities).forEach(ctor => {
      for (let i = 0; i < ctor.weight; i++) {
        ctors.push(ctor)
      }
    })

    for (let i = 0; i < this.scale ** 2; i++) {
      entities.push(new ctors[Math.floor(Math.random() * ctors.length)]())
    }

    return entities
  }

  public peek(entity: Entity) {
    const index = this.entities.indexOf(entity)

    const checks = [
      index - this.scale - 1,
      index - this.scale,
      index - this.scale + 1,
      index - 1,
      index + 1,
      index + this.scale - 1,
      index + this.scale,
      index + this.scale + 1,
    ]

    return checks.map(checkIndex => this.entities[checkIndex]).filter(entity => !!entity).reduce<Partial<Record<EntityName, Entity[]>>>((map, entity) => {
      return {
        ...map,
        [entity.entityName]: [...(map[entity.entityName] ?? []), entity]
      }
    }, {})
  }

  public peekRandom(entity: Entity, ...ctors: { new (): Entity }[]) {
    const index = this.entities.indexOf(entity)

    const checks = [
      index - this.scale - 1,
      index - this.scale,
      index - this.scale + 1,
      index - 1,
      index + 1,
      index + this.scale - 1,
      index + this.scale,
      index + this.scale + 1,
    ]

    let entities = checks.map(checkIndex => this.entities[checkIndex]).filter(entity => !!entity)

    if (ctors.length) {
      entities = entities.filter(entity => ctors.find(ctor => entity.is(ctor)))
    }

    if (!entities.length) {
      return null
    }

    return entities[Math.floor(Math.random() * entities.length)]
  }

  public replace(a: Entity | null, b: Entity | null) {
    if (!a || !b) {
      return
    }

    const bIndex = this.entities.indexOf(b)
    
    if (bIndex > 0) {
      this.entities.splice(bIndex, 1, new Space())
    }
    this.entities.splice(this.entities.indexOf(a), 1, b)

    a.stop()
    b.start()

    this.generation++
  }

  public map<T>(cb: (entity: Entity, x: number, y: number) => T): T[] {
    return this.entities.map((entity, index) => cb(entity, index % this.scale, Math.floor(index / this.scale)))
  }
}