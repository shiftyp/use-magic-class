import { createServer, Response, Model, Factory } from "miragejs"

import fake from "faker"

createServer({
  models: {
    post: Model.extend({})
  },

  factories: {
    post: Factory.extend({
      title: () => fake.lorem.lines(1),
      date: () => fake.date.past().valueOf(),
      blurb: () => fake.lorem.paragraph(2)
    })
  },

  routes() {
    this.post("/login", (schema, request) => {
      const { name, pass } = JSON.parse(request.requestBody)

      if (name === "demo" && pass === "demo") {
        return { id: 1234 }
      } else if (name === "error") {
        return new Response(500)
      }

      return new Response(404)
    })

    this.post("/logout", (schema, request) => {
      return new Response(200)
    })

    this.get("/posts", (schema, request) => {
      const { id, column, ascending, query } = request.queryParams
      const search = new RegExp(query, "i")

      return {
        //@ts-ignore
        list: schema.posts
          .all()
          .models.filter(
            //@ts-ignore
            post =>
              query === "" ||
              post.title.match(search) ||
              post.blurb.match(search)
          )
          //@ts-ignore
          .sort((a, b) =>
            ascending === "true"
              ? a[column] > b[column]
                ? 1
                : -1
              : a[column] > b[column]
              ? -1
              : 1
          )
      }
    })
  },
  seeds: server => {
    server.createList("post", 100)
  }
})
