import onChange from 'on-change'
import { validateUrl } from './validation.js'
import { loadAndParseFeed } from './utils.js'
import updatePosts from './updatePosts.js'
import i18n from 'i18next'
import resources from './locales/index.js'
import {
  handleFormState,
  renderFeedback,
  renderFeeds,
  renderPosts,
  renderStaticTexts,
  renderModal
} from './view.js'


const initApp = async (container) => {
  const i18nInstance = i18n.createInstance()

  await i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  })

const elements = {
    form: container.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type="submit"]'),
  }

  renderStaticTexts(elements, i18nInstance)

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

  const state = onChange(initialState, (path) => {
    if (path === 'process.state') {
      handleFormState(elements, state.process.state)
    }

    if (path === 'process.error' || path === 'form.success') {
      renderFeedback(elements, state.process.error, state.form.success, i18nInstance)
    }

    if (path === 'form.url') {
      elements.input.value = state.form.url
    }

    if (path === 'data.feeds') {
      renderFeeds(container, state.data.feeds)
    }

    if (path === 'data.posts' || path === 'ui.readPosts') {
      renderPosts(container, state.data.posts, state.ui.readPosts)
    }

    if (path === 'ui.lng') {
      i18nInstance.changeLanguage(state.ui.lng)
        .then(() => {
          renderStaticTexts(elements, i18nInstance)
          if (state.process.error || state.form.success) {
            renderFeedback(elements, state.process.error, state.form.success, i18nInstance)
          }
        })
    }
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const url = formData.get('url')

    state.process.error = null
    state.form.success = false
    state.form.url = url
    state.process.state = 'validating'

    validateUrl(url, state.data.feedUrls, i18nInstance)
      .then(() => {
        state.process.state = 'valid'
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

        updatePosts(state)

        state.process.state = 'filling'
        state.form.url = ''
        state.process.error = null
        state.form.success = true
      })
      .catch((error) => {
        state.process.state = 'invalid'
        state.form.success = false

        if (error.name === 'ValidationError') {
          state.process.error = error.errors[0]
        }
        else if (error.message.includes('invalidRss')) {
          state.process.error = i18nInstance.t('errors.notRss')
        }
        else if (error.message.includes('timeout') || error.message.includes('Network')) {
          state.process.error = i18nInstance.t('errors.network')
        }
        else {
          state.process.error = `Ошибка: ${error.message}`
        }
      })
  }

  const handleInput = (e) => {
    state.form.url = e.target.value
    state.process.error = null
    state.form.success = false
    state.process.state = 'filling'
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
  elements.input.addEventListener('input', handleInput)
  document.addEventListener('click', handleModalOpen)

  updatePosts(state)

  return { state, i18nInstance, elements }
}

export { initApp }
