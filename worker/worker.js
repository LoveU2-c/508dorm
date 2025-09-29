export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const data = await request.json()
      const timestamp = Date.now()
      await env.POSTS.put(`post-${timestamp}`, JSON.stringify(data))
      return new Response('Post saved', { status: 200 })
    }

    if (request.method === 'GET') {
      const list = await env.POSTS.list()
      const posts = await Promise.all(
        list.keys.map(async key => {
          const value = await env.POSTS.get(key.name)
          return JSON.parse(value)
        })
      )
      return new Response(JSON.stringify(posts), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Method Not Allowed', { status: 405 })
  }
}
