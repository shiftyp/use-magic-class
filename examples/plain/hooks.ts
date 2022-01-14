import { createContext, useState, useMemo, useContext, useEffect, useCallback } from "react"
  
export type Post = {
  id: string
  title: string
  date: number
  blurb: string
}

type ErrorStatus = `${4 | 5}${number | ""}`

export const useRequestData = <Payload>(msgs: Partial<Record<ErrorStatus, string>>) => {
  const [payload, setPayload] = useState<Payload | null>(null)
  const [err, setError] = useState<ErrorStatus | null>(null)

  const errMessage = useMemo(() => {
    return (
      err &&
      (msgs[err] || msgs[err.substring(0, 1) as ErrorStatus])
    )
  }, [err])

  const doFetch = useCallback(async (url: string, init?: RequestInit) => {
    const resp = await fetch(url, init)

    switch (resp.status) {
      case 200:
      case 201:
      case 202:
        setPayload((await resp.json()) as Payload)
        setError(null)
        break
      default:
        setPayload(null)
        setError(resp.status.toString() as ErrorStatus)
    }

    return err
  }, [])

  return {
    payload,
    setPayload,
    err,
    setError,
    errMessage,
    doFetch
  }
}

export type RequestData = ReturnType<typeof useRequestData>

export const useUser = () => {
  const reqData = useRequestData<{ id: string }>({
    "404": "Incorrect Username or Password",
    "5": "Error logging in, try again later"
  })
  const { payload, setPayload, doFetch } = reqData
  const [name, setName] = useState<string>("")
  const [pass, setPass] = useState<string>("")

  const id = useMemo(() => {
    return payload && payload.id
  }, [payload])

  const login = useCallback(async () => {
    const err = await doFetch("/login", {
      method: "post",
      body: JSON.stringify({
        name,
        pass,
      })
    })

    if (!err) {
      setName("")
    }

    setPass("")
  }, [name, pass])

  const logout = useCallback(async () => {
    if (id !== null) {
      const err = await doFetch("/logout", {
        method: "post",
        body: JSON.stringify({
          id,
        })
      })

      if (!err) {
        setPayload(null)
      }
    }
  }, [id])

  return {
    ...reqData,
    id,
    name,
    setName,
    pass, 
    setPass,
    login,
    logout,
  }
}

export type User = ReturnType<typeof useUser>

export const UserContext = createContext<User | null>(null)

export const useFilter = () => {
  const [query, search] = useState<string | null>(null)

  const clear = useCallback(() => {
    search(null)
  }, [])

  return {
    query,
    search,
    clear,
  }
}

export type Filter = ReturnType<typeof useFilter>

export const useSort = () => {
  const [column, setColumn] = useState<"title" | "date">("date")
  const [ascending, setAscending] = useState<boolean>(true)

  const change = useCallback(({
    newColumn = column,
    newAscending = newColumn === "date" ? false : true,
  } : {
    newColumn?: typeof column
    newAscending?: boolean
  }) => {
    setColumn(newColumn)
    setAscending(newAscending)
  }, [column])

  return {
    column,
    ascending,
    change,
  }
}

export type Sort = ReturnType<typeof useSort>

export const usePostList = () => {
  const reqData = useRequestData<{ list: Post[] }>( {
    "5": "Error retrieving posts",
    "404": "No posts found",
    "403": "You don't have permission to view these posts"
  })
  const { setPayload, payload, doFetch } = reqData
  
  const list = useMemo(() => {
    return payload && payload.list
  }, [payload])

  const user = useContext(UserContext)

  const sort = useSort()

  const filter = useFilter()

  useEffect(() => {
    (async () => {
      if (user && user.id) {
        await doFetch(
          `/posts?${new URLSearchParams({
            column: `${sort.column}`,
            ascending: `${sort.ascending}`,
            id: `${user.id}`,
            query: `${filter.query || ''}`
          })}`
        )
      } else {
        setPayload(null)
      }
    })()
  }, [
    filter.query,
    sort.column,
    sort.ascending,
    user?.id
  ])

  return {
    ...reqData,
    list,
    sort,
    filter,
  }
}

export type PostList = ReturnType<typeof usePostList>