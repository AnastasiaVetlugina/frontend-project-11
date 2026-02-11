import axios from 'axios'
import { parseRssFeed } from './utils.js'

const getProxiedUrl = (url) => {
  const proxy = 'https://allorigins.hexlet.app/get'
  return `${proxy}?disableCache=true&url=${encodeURIComponent(url)}`
}

const updatePosts = (state) => {
  if (!state.data.feeds || state.data.feeds.length === 0) {
    setTimeout(() => updatePosts(state), 5000)
    return
  }

  const feedPromises = state.data.feeds.map((feed) => {
    const url = getProxiedUrl(feed.url)

    return axios.get(url, { timeout: 5000 })
      .then((response) => {
        if (!response.data.contents) return

        try {
          const { posts: newPosts } = parseRssFeed(response.data.contents)

          const existingLinks = state.data.posts.map(post => post.link)

          const uniqueNewPosts = newPosts.filter(post => 
            post.link && !existingLinks.includes(post.link)
          )

          if (uniqueNewPosts.length > 0) {
            state.data.posts.unshift(...uniqueNewPosts.map(post => ({
              ...post,
              feedId: feed.id,
            })))
          }
        } catch {
          // Игнорируем ошибки при обновлении
        }
      })
      .catch(() => {
        // Игнорируем ошибки сети
      })
  })

  Promise.allSettled(feedPromises)
    .finally(() => {
      setTimeout(() => updatePosts(state), 5000)
    })
}

export default updatePosts
