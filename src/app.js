import axios from 'axios'
import { parseRssFeed } from './parser.js'
import { validateUrl } from './validation.js'
import i18n from 'i18next'
import resources from './locales/index.js'
import { createWatchedState, renderModal } from './view.js'

const loadAndParseFeed = (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`

  return axios.get(proxyUrl, { timeout: 10000 })
    .then(({ data }) => parseRssFeed(data.contents))
}

const getProxiedUrl = (url) => {
  const proxy = 'https://allorigins.hexlet.app/get'
  return `${proxy}?disableCache=true&url=${encodeURIComponent(url)}`
}

const updatePosts = (state, container) => {
  if (!state.data.feeds?.length) {
    setTimeout(() => updatePosts(state, container), 5000)
    return
  }

  const feedPromises = state.data.feeds.map((feed) => {
    const url = getProxiedUrl(feed.url)

    return axios.get(url, { timeout: 5000 })
      .then((response) => {
        const { posts: newPosts } = parseRssFeed(response.data.contents)

        const existingLinks = state.data.posts.map(post => post.link)
        const uniqueNewPosts = newPosts.filter(post =>
          post.link && !existingLinks.includes(post.link),
        )

        if (uniqueNewPosts.length > 0) {
          state.data.posts.unshift(...uniqueNewPosts.map(post => ({
            ...post,
            feedId: feed.id,
          })))
        }
      })
      .catch(() => {
        // Игнорируем ошибки
      })
  })

  Promise.allSettled(feedPromises)
    .finally(() => {
      setTimeout(() => updatePosts(state, container), 5000)
    })
}

const initApp = (container) => {
  const i18nInstance = i18n.createInstance()

  return i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const elements = {
      form: container.querySelector('.rss-form'),
      input: document.querySelector('#url-input'),
      feedback: document.querySelector('.feedback'),
      submitBtn: document.querySelector('button[type="submit"]'),
    }

    const initialState = {
      ui: {
        lng: 'ru',
        readPosts: [],
      },
      process: {
        state: 'filling',
        error: null,
      },
      form: {
        url: '',
        success: false,
      },
      data: {
        feeds: [],
        posts: [],
        feedUrls: [],
      },
    }

    const state = createWatchedState(initialState, container, elements, i18nInstance)

    const handleSubmit = (e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const url = formData.get('url')

      state.process.error = null
      state.form.success = false
      state.process.state = 'validating'

      validateUrl(url, state.data.feedUrls)
        .then(() => {
          state.process.state = 'submitting'
          return loadAndParseFeed(url)
        })
        .then(({ feed, posts }) => {
          state.data.feedUrls.push(url)

          const feedWithUrl = { ...feed, url }
          state.data.feeds.unshift(feedWithUrl)

          const postsWithFeedId = posts.map(post => ({
            ...post,
            feedId: feed.id,
          }))
          state.data.posts.unshift(...postsWithFeedId)

          state.process.state = 'filling'
          e.target.reset()
          state.process.error = null
          state.form.success = true
        })
        .catch((error) => {
          state.process.state = 'invalid'
          state.form.success = false
          state.process.error = error
        })
    }

    const handleModalOpen = (e) => {
      const viewButton = e.target.closest('button[data-id]')
      if (!viewButton) return

      const postId = viewButton.dataset.id
      const postTitle = viewButton.dataset.title
      const postDescription = viewButton.dataset.description
      const postLink = viewButton.dataset.link

      renderModal(postTitle, postDescription, postLink)

      if (postId && !state.ui.readPosts.includes(postId)) {
        state.ui.readPosts.push(postId)
      }
    }

    elements.form.addEventListener('submit', handleSubmit)
    document.addEventListener('click', handleModalOpen)

    updatePosts(state, container)

    return { state, i18nInstance, elements }
  })
}

export { initApp }
