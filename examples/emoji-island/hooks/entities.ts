import { isContext, isEffect, isMemo } from 'use-magic-class'
import { Game } from './game'
import { GameContext } from './contexts'

export enum EntityName {
  space = 'space',
  mountain = 'mountain',
  volcano = 'volcano',
  tree = 'tree',
  fruit = 'fruit',
  herbivore = 'herbivore',
  carnivore = 'carnivore',
  fire = 'fire',
  bones = 'bones',
  box = 'box',
  poop = 'poop',
}

export abstract class Entity {
  static weight: number

  public abstract entityName: EntityName
  protected abstract speed: number
  public abstract energy: number
  public abstract animate: boolean
  protected abstract emojis: string[]

  protected abstract act: () => void

  private interval: number | null = null

  @isEffect([])
  public start() {
    if (this.speed < Infinity) {
      this.interval = setInterval(this.act, this.speed)
    }

    return () => this.stop()
  }

  public stop() {
    this.interval ?? clearInterval(this.interval)
  }

  @isContext(GameContext)
  private _game: Game | null = null

  public get game(): Game | null {
    return this._game
  }
  public set game(value: Game | null) {
    this._game = value
  }

  @isMemo([])
  public get emoji(): string {
    return this.emojis[Math.floor(Math.random() * this.emojis.length)]
  }

  public is(Constructor: { new (): Entity }) {
    return this instanceof Constructor
  }
}

export class Space extends Entity {
  static weight = 100

  public entityName = EntityName.space
  public id = `${Math.random()}`
  public energy = 0
  public animate = false
  protected speed = Infinity

  protected emojis = [' ']

  protected act = () => {
    console.log(this.id)
  }
}

export class Mountain extends Entity {
  static weight = 10

  public entityName = EntityName.mountain
  public id = `${Math.random()}`
  public energy = 0
  public animate = false
  protected speed = 50000

  protected act = () => {
    if (Math.random() < .5) {
      this.game?.replace(this, new Volcano())
    }
  }

  protected emojis = ['⛰️', '🏔️']
}

export class Volcano extends Entity {
  static weight = 0

  public entityName = EntityName.volcano
  public id = `${Math.random()}`
  public energy = 0
  public animate = false
  protected speed = 1000

  protected act = () => {
    const { game } = this
    game !== null && game.replace(game.peekRandom(this), new Fire())
  }

  protected emojis = ['🌋']
}

export class Tree extends Entity {
  static weight = 20

  public entityName = EntityName.tree
  public id = `${Math.random()}`
  public energy = 0
  public animate = true

  protected speed = 10000

  protected act = () => {
    const { game } = this
    game !== null && game.replace(game.peekRandom(this, Space), new Fruit())
  }

  protected emojis = ['🌲', '🌳', '🌴']
}

export class Fruit extends Entity {
  static weight = 0

  public entityName = EntityName.fruit
  public id = `${Math.random()}`
  public energy = 0
  public animate = true

  protected speed = 5000

  protected act = () => {
    const { game } = this
    game !== null && game.replace(this, new Tree())
  }

  protected emojis = ['🍏', '🍎', '🍐', '🍊', '🍋', '🍑', '🥭']
}

export class Herbivore extends Entity {
  static weight = 10

  public entityName = EntityName.herbivore
  public id = `${Math.random()}`
  public energy = 20
  public animate = true

  protected speed = 5000

  protected act = () => {
    const { game } = this
    if (game) {
      const dice = Math.random()
      const fruit = game.peekRandom(this, Fruit)

      if (fruit) {
        game.replace(fruit, this)
        this.energy++
        return
      }

      if (this.energy === 0) {
        game.replace(this, new Bones())
        return
      }

      if (dice < 0.5) {
        const space = game.peekRandom(this, Space)

        if (space) {
          game.replace(space, this)
        }
      }
    }
  }

  protected emojis = ['🐑', '🐏', '🦌', '🐂', '🐃', '🦙']
}

export class Carnivore extends Entity {
  public weight = 5
  public entityName = EntityName.carnivore
  public id = `${Math.random()}`
  public energy = 20
  public animate = true

  protected speed = 2000

  protected act = () => {
    const { game } = this
    if (game) {
      const dice = Math.random()
      const food = game.peekRandom(this, Herbivore)

      if (food) {
        game.replace(food, this)
        this.energy++
        return
      }

      if (this.energy === 0) {
        game.replace(this, new Bones())
        return
      }

      if (dice < 0.5) {
        const space = game.peekRandom(this, Space)

        if (space) {
          game.replace(space, this)
        }
      }
    }
  }

  protected emojis = ['🐅', '🐆']
}

export class Fire extends Entity {
  static weight = 0

  public entityName = EntityName.fire
  public id = `${Math.random()}`
  public energy = 5
  public animate = true

  protected speed = 1000

  protected act = () => {
    const { game } = this
    if (game) {
      const dice = Math.random()
      const fuel = game.peekRandom(this, Tree)

      if (fuel && dice < 0.5) {
        game.replace(fuel, new Fire())
        return
      }

      this.energy--

      if (this.energy === 0) {
        game.replace(this, new Space())
        return
      }
    }
  }

  protected emojis = ['🔥']
}

export class Bones extends Entity {
  static weight = 0

  public entityName = EntityName.bones
  public id = `${Math.random()}`
  public energy = 0
  public animate = true

  protected speed = 5000

  protected act = () => {
    this.game?.replace(this, new Space())
  }

  protected emojis = ['🦴', '💀']
}

export class Box extends Entity {
  static weight = 0

  public entityName = EntityName.box
  public id = `${Math.random()}`
  public energy = 0
  public animate = true

  protected speed = 5000

  protected act = () => {
    this.game?.replace(this, new Space())
  }

  protected emojis = ['📦']
}

export class Poop extends Entity {
  static weight = 0

  public entityName = EntityName.poop
  public id = `${Math.random()}`
  public energy = 0
  public animate = true
  protected speed = 5000

  protected act = () => {
    this.game?.replace(this, new Space())
  }

  protected emojis = ['💩']
}

export const Entities: {
  [Name in EntityName]: { new (): Entity; weight: number }
} = {
  space: Space,
  mountain: Mountain,
  volcano: Volcano,
  tree: Tree,
  fruit: Fruit,
  carnivore: Carnivore,
  herbivore: Herbivore,
  fire: Fire,
  bones: Bones,
  box: Box,
  poop: Poop,
}
