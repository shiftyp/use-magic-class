import { isContext, isEffect, isMemo, isState } from 'use-magic-class'
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

  public abstract scale: number
  public abstract entityName: EntityName
  public abstract speed: number
  public abstract energy: number
  public abstract animate: boolean
  public abstract id: string
  protected abstract emojis: string[]

  public abstract act: () => void
  public abstract interact: () => void

  @isState
  public position = [0, 0]

  protected stopped = false

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

  public scale = 1
  public entityName = EntityName.space
  public id = `${Math.random()}`
  public energy = 0
  public animate = false
  public speed = Infinity
  public emojis = [' ']

  public act = () => {}

  public interact = () => {
    this.game?.replace(this, Box)
  }
}

export class Mountain extends Entity {
  static weight = 10

  public scale = 1
  public entityName = EntityName.mountain
  public id = `${Math.random()}`
  public energy = 0
  public animate = false
  public speed = 50000

  public act = () => {
    if (Math.random() < 0.5) {
      this.game?.replace(this, Volcano)
    }
  }

  public interact = () => {
    this.game?.replace(this, Volcano)
  }

  protected emojis = ['1F3D4', '26F0', '1F5FB']
}

export class Volcano extends Entity {
  static weight = 0

  public scale = 1
  public entityName = EntityName.volcano
  public id = `${Math.random()}`
  public energy = 0
  public animate = false
  public speed = 2000

  public act = () => {
    const { game } = this
    if (game !== null) {
      const dice = Math.random()

      if (dice < 0.25) {
        game.replace(this, Mountain)
      } else {
        const target = game.peekRandom(this, Space, Tree, Herbivore, Carnivore)
        if (target) {
          game.replace(target, Fire)
        }
      }
    }
  }

  public interact = () => {
    this.game?.replace(this, Mountain)
  }

  protected emojis = ['1F30B']
}

export class Tree extends Entity {
  static weight = 20

  public scale = 0.75
  public entityName = EntityName.tree
  public id = `${Math.random()}`
  public energy = 0
  public animate = true

  public speed = 8000

  public act = () => {
    const { game } = this
    if (game !== null) {
      for (let i = 0; i < 4; i++) {
        const dice = Math.random()
        if (dice < 0.5) {
          const target = game.peekRandom(this, Space)

          if (target) {
            game.replace(target, Fruit)
          }
        }
      }
    }
  }

  public interact = () => {
    this.game?.replace(this, Fire)
  }

  protected emojis = ['1F332', '1F334', '1F333']
}

export class Fruit extends Entity {
  static weight = 0

  public scale = 0.4
  public entityName = EntityName.fruit
  public id = `${Math.random()}`
  public energy = 0
  public animate = true

  public speed = 8000

  public act = () => {
    const { game } = this
    game !== null && game.replace(this, Tree)
  }

  public interact = () => {
    this.game?.replace(this, Space)
  }

  protected emojis = ['1F34A', '1F34B', '1F34C', '1F34D', '1F34E', '1F34F']
}

export class Herbivore extends Entity {
  static weight = 20

  public scale = 0.5
  public entityName = EntityName.herbivore
  public id = `${Math.random()}`
  public energy = 20
  public animate = true

  public speed = 1000

  public act = () => {
    const { game } = this
    if (game) {
      const dice = Math.random()
      const fruit = game.peekRandom(this, Fruit)

      if (fruit) {
        game.replace(fruit, this)
        this.energy += 5
        return
      } else {
        this.energy--
      }

      if (this.energy === 0) {
        game.replace(this, Bones)
        return
      }

      const space = game.peekRandom(this, Space)

      if (space) {
        if (this.energy > 50) {
          game.replace(space, Herbivore)
          this.energy -= 30
        } else {
          if (this.energy > 40) {
            game.replace(this, Poop)
            this.energy -= 10
          }

          game.replace(space, this)
        }
      }
    }
  }

  public interact = () => {
    this.game?.replace(this, Bones)
  }

  protected emojis = [
    '1F40F',
    '1F411',
    '1F98C',
    '1F402',
    '1F403',
    '1F999',
    '1F992',
  ]
}

export class Carnivore extends Entity {
  static weight = 3

  public scale = 0.5
  public entityName = EntityName.carnivore
  public id = `${Math.random()}`
  public energy = 20
  public animate = true

  public speed = 6000

  public act = () => {
    const { game } = this
    if (game) {
      const dice = Math.random()
      const food = game.peekRandom(this, Herbivore)

      if (food && dice >= 0.75) {
        game.replace(food, this)
        this.energy++
        return
      } else {
        this.energy--
      }

      if (this.energy === 0) {
        game.replace(this, Bones)
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

  public interact = () => {
    this.game?.replace(this, Bones)
  }

  protected emojis = ['1F405', '1F406']
}

export class Fire extends Entity {
  static weight = 0

  public scale = 0.7
  public entityName = EntityName.fire
  public id = `${Math.random()}`
  public energy = 3
  public animate = true

  public speed = 1000

  public act = () => {
    const { game } = this
    if (game) {
      const dice = Math.random()
      const fuel = game.peekRandom(this, Tree)

      if (fuel && dice < 0.3) {
        game.replace(fuel, Fire)
      }

      this.energy--

      if (this.energy <= 0) {
        game.replace(this, Space)
        return
      }
    }
  }

  public interact = () => {
    this.game?.replace(this, Space)
  }

  protected emojis = ['1F525']
}

export class Bones extends Entity {
  static weight = 0

  public scale = 0.25
  public entityName = EntityName.bones
  public id = `${Math.random()}`
  public energy = 0
  public animate = true

  public speed = 5000

  public act = () => {
    this.game?.replace(this, Space)
  }

  public interact = () => {
    this.game?.replace(this, Space)
  }

  protected emojis = ['1F9B4', '1F480']
}

export class Box extends Entity {
  static weight = 0

  public scale = 0.25
  public entityName = EntityName.box
  public id = `${Math.random()}`
  public energy = 0
  public animate = true

  public speed = 5000

  public act = () => {
    this.game?.replace(this, this.game.newEntity())
  }

  public interact = () => {
    this.game?.replace(this, Space)
  }

  protected emojis = ['1F4E6']
}

export class Poop extends Entity {
  static weight = 0

  public scale = 0.2
  public entityName = EntityName.poop
  public id = `${Math.random()}`
  public energy = 0
  public animate = true
  public speed = 5000

  public act = () => {
    this.game?.replace(this, Tree)
  }
  public interact = () => {
    this.game?.replace(this, Space)
  }

  protected emojis = ['1F4A9']
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