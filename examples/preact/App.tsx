import { h, Fragment } from 'preact'
import { useContext, useRef } from "preact/hooks"

import { useMagicClass } from "use-magic-class/preact"

import {
  User,
  UserContext,
  Sort,
  Filter,
  PostList,
  RequestData,
  Post
} from "common-example/hooks"

const Login = ({ user }: { user: User }) => {
  const form = useRef<HTMLFormElement>(null)

  return (
    <form
      ref={form}
      onSubmit={e => {
        e.preventDefault()
        user.login()
      }}
    >
      <div>
        <label>
          <span>User</span>
          <input
            name="name"
            type="text"
            value={user.name}
            // @ts-ignore
            onChange={({ target: { value } }) => (user.name = value)}
          />
        </label>
      </div>
      <div>
        <label>
          <span>Pass</span>
          <input
            name="pass"
            type="password"
            value={user.pass}
            // @ts-ignore
            onChange={({ target: { value } }) => (user.pass = value)}
          />
        </label>
      </div>
      <button type="submit">Login</button>
    </form>
  )
}

const Logout = ({ user }: { user: User }) => {
  return (
    <form>
      <button
        type="button"
        onClick={() => {
          user.logout()
        }}
      >
        Logout
      </button>
    </form>
  )
}

const ErrMessage = ({ data }: { data: RequestData<any> }) => {
  if (data.errMessage) {
    return <div>{data.errMessage}</div>
  }

  return null
}

const Header = () => {
  const user = useContext(UserContext)

  return (
    <header>
      {user ? (
        <>
          {user.id === null ? <Login user={user} /> : <Logout user={user} />}
          <ErrMessage data={user} />{" "}
        </>
      ) : null}
    </header>
  )
}

const PostItem = ({ post }: { post: Post }) => {
  return (
    <li>
      {new Date(post.date).toDateString()}: <b>{post.title}</b>{" "}
      <p>{post.blurb}</p>
    </li>
  )
}

const SortingAndFilter = ({ sort, filter }: { sort: Sort; filter: Filter }) => {
  return (
    <form>
      <label>
        <span>Sort</span>
        <select
          onChange={e => {
            sort.change({
                // @ts-ignore
              column: e.target.value as Sort["column"]
            })
          }}
          value={sort.column}
        >
          <option value="date">Date</option>
          <option value="title">Title</option>
        </select>
      </label>
      <label>
        <span>Ascending</span>
        <input
          type="checkbox"
          checked={sort.ascending}
          onChange={({ target }) => {
            // @ts-ignore
            sort.change({ ascending: target.checked })
          }}
        />
      </label>
      <label>
        <span>Search</span>
        <input
          type="text"
          onChange={e => {
            // @ts-ignore
            filter.search(e.target.value)
          }}
        />
      </label>
    </form>
  )
}

const List = () => {
  const posts = useMagicClass(PostList)

  return (
    <div>
      <SortingAndFilter sort={posts.sort} filter={posts.filter} />
      <ul>
        {posts.list?.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </ul>
      <ErrMessage data={posts} />
    </div>
  )
}

const App = () => {
  const user = useMagicClass(User)

  return (
    <div>
      <UserContext.Provider value={user}>
        <Header />
        {user.id ? <List /> : null}
      </UserContext.Provider>
    </div>
  )
}

export default App
