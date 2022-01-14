import { createContext } from "preact"
  
import { isContext, isEffect, isMemo, isState, isMagic } from "use-magic-class"

export type Post = {
  id: string
  title: string
  date: number
  blurb: string
}

type ErrorStatus = `${4 | 5}${number | ""}`

export class RequestData<Payload> {
  @isState
  public payload: Payload | null = null
  @isState
  public err: ErrorStatus | null = null

  protected msgs = {} as Partial<Record<ErrorStatus, string>>

  @isMemo<RequestData<Payload>>(({ err }) => [
    err
  ])
  public get errMessage () {
    return (
      this.err &&
      (this.msgs[this.err] || this.msgs[this.err.substring(0, 1) as ErrorStatus])
    )
  }

  protected async fetch(url: string, init?: RequestInit) {
    const resp = await fetch(url, init)

    switch (resp.status) {
      case 200:
      case 201:
      case 202:
        this.payload = (await resp.json()) as Payload
        this.err = null
        break
      default:
        this.payload = null
        this.err = resp.status.toString() as ErrorStatus
    }

    return this.err
  }
}

export class User extends RequestData<{ id: Number }> {
  @isState
  public name: string = ""
  @isState
  public pass: string = ""

  public get id() {
    return this.payload && this.payload.id
  }

  protected msgs = {
    "404": "Incorrect Username or Password",
    "5": "Error logging in, try again later"
  }

  public async login() {
    const err = await this.fetch("/login", {
      method: "post",
      body: JSON.stringify({
        name: this.name,
        pass: this.pass
      })
    })

    if (!err) {
      this.name = ""
    }
    this.pass = ""
  }

  async logout() {
    if (this.id !== null) {
      const err = await this.fetch("/logout", {
        method: "post",
        body: JSON.stringify({
          id: this.id
        })
      })

      if (!err) {
        this.payload = null
      }
    }
  }
}

export const UserContext = createContext<User | null>(null)

export class Filter {
  @isState
  public query: string | null = null

  public search(query: string) {
    this.query = query
  }

  public clear() {
    this.query = null
  }
}

export class Sort {
  @isState
  public column: "title" | "date" = "date"
  @isState
  public ascending: boolean = true

  change({
    column,
    ascending
  }: {
    column?: Sort["column"]
    ascending?: boolean
  }) {
    this.column = column || this.column
    this.ascending = ascending !== undefined ? ascending : column === "date" ? false : true
  }
}

export class PostList extends RequestData<{ list: Post[] }> {
  public get list() {
    return this.payload && this.payload.list
  }

  protected msgs = {
    "5": "Error retrieving posts",
    "404": "No posts found",
    "403": "You don't have permission to view these posts"
  }

  @isContext(UserContext)
  private user: User | null = null

  @isMagic
  public sort = new Sort()

  @isMagic
  filter = new Filter()

  @isEffect<PostList>(({ filter, sort, user }) => [
    filter.query,
    sort.column,
    sort.ascending,
    user?.id
  ])
  private update = async () => {
    if (this.user && this.user.id) {
      await this.fetch(
        `/posts?${new URLSearchParams({
          column: `${this.sort.column}`,
          ascending: `${this.sort.ascending}`,
          id: `${this.user.id}`,
          query: `${this.filter.query || ''}`
        })}`
      )
    } else {
      this.payload = null
    }
  }
}
