import axios from 'axios'

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
        if (!response.data.contents) {
          return
        }

        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(response.data.contents, 'application/xml')
        const items = xmlDoc.querySelectorAll('item')

        if (items.length === 0) {
          return
        }

        const existingLinks = state.data.posts.map(post => post.link)
        const newPosts = []

        items.forEach((item) => {
          const getTextContent = (selector) => {
            const element = item.querySelector(selector)
            return element ? element.textContent.trim() : ''
          }

          const link = getTextContent('link')

          if (link && !existingLinks.includes(link)) {
            newPosts.push({
              id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: getTextContent('title'),
              description: getTextContent('description'),
              link,
              feedId: feed.id,
            })
          }
        })

        if (newPosts.length > 0) {
          state.data.posts.unshift(...newPosts)
        }
      })
      .catch(() => {
        // Игнорируем ошибки при обновлении
      })
  })

  Promise.allSettled(feedPromises)
    .finally(() => {
      setTimeout(() => updatePosts(state), 5000)
    })
}

export default updatePosts
