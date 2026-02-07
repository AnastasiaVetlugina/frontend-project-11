import { validateUrl } from './validation.js'
import { createView } from './view.js'
import { loadAndParseFeed } from './utils.js'
import updatePosts from './updatePosts.js'
import i18n from 'i18next'
import resources from './locales/index.js'

const initApp = container => {
  const i18nInstance = i18n.createInstance()

  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  })

  const handleSubmit = (formData, state, i18nInstance) => {
    state.process.state = 'validating'
    state.process.error = null
    state.form.success = false

    validateUrl(formData.url, state.data.feedUrls, i18nInstance)
      .then(() => {
        state.process.state = 'valid'
        state.process.error = null
        state.process.state = 'submitting'

        return loadAndParseFeed(formData.url)
      })
      .then(({ feed, posts }) => {
        state.data.feedUrls.push(formData.url)

        const feedWithUrl = {
          ...feed,
          url: formData.url,
        }
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
      .catch(error => {
        state.process.state = 'invalid'

        if (error.name === 'ValidationError') {
          state.process.error = error.errors[0]
        } else if (error.message.includes('invalidRss')) {
          state.process.error = i18nInstance.t('errors.notRss')
        } else if (error.message.includes('timeout')) {
          state.process.error = i18nInstance.t('errors.network')
        } else if (error.message.includes('Network')) {
          state.process.error = i18nInstance.t('errors.network')
        } else {
          state.process.error = `Ошибка: ${error.message}`
        }

        state.form.success = false
      })
  }

  const view = createView(container, handleSubmit, i18nInstance)

  updatePosts(view.state)

  return { view, i18nInstance }
}

export { initApp }
