import onChange from 'on-change'

const handleFormState = (elements, formState) => {
  switch (formState) {
    case 'validating':
    case 'submitting':
      elements.submitBtn.disabled = true
      elements.input.disabled = true
      break
    case 'filling':
    case 'invalid':
    case 'valid':
      elements.submitBtn.disabled = false
      elements.input.disabled = false
      elements.input.focus()
      break
    default:
      throw new Error(`Unknown form state: ${formState}`)
  }
}

const renderFeedback = (elements, error, success, i18nInstance) => {
  let message = ''
  if (error) {
    message = error
  } 
  else if (success) {
    message = i18nInstance.t('app.success')
  }

  elements.feedback.textContent = message

  elements.feedback.classList.remove('text-danger', 'text-success')
  elements.input.classList.remove('is-invalid')

  if (error) {
    elements.feedback.classList.add('text-danger')
    elements.input.classList.add('is-invalid')
  } 
  else if (success) {
    elements.feedback.classList.add('text-success')
  }
}

const renderUrl = (elements, url) => {
  elements.input.value = url
}

const renderFeeds = (container, feeds) => {
  const feedsContainer = container.querySelector('.feeds .list-group')

  if (feeds.length === 0) {
    feedsContainer.innerHTML = ''
    return
  }

  const feedsList = document.createElement('ul')
  feedsList.className = 'list-group border-0 rounded-0'

  feeds.forEach((feed) => {
    const feedItem = document.createElement('li')
    feedItem.className = 'list-group-item border-0 border-end-0'

    feedItem.innerHTML = `
      <h3 class="h6 m-0">${feed.title}</h3>
      <p class="m-0 small text-black-50">${feed.description}</p>
    `

    feedsList.appendChild(feedItem)
  })

  feedsContainer.innerHTML = ''
  feedsContainer.appendChild(feedsList)
}

const renderPosts = (container, posts, readPosts) => {
  const postsContainer = container.querySelector('.posts .list-group')

  if (posts.length === 0) {
    postsContainer.innerHTML = ''
    return
  }

  const postsList = document.createElement('ul')
  postsList.className = 'list-group border-0 rounded-0'

  const sortedPosts = [...posts].reverse()

  sortedPosts.forEach((post) => {
    const isRead = readPosts.includes(post.id)
    const fontWeightClass = isRead ? '' : 'fw-bold'

    const postItem = document.createElement('li')
    postItem.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'

    const postLink = document.createElement('a')
    postLink.href = post.link
    postLink.className = fontWeightClass
    postLink.dataset.id = post.id
    postLink.target = '_blank'
    postLink.rel = 'noopener noreferrer'
    postLink.textContent = post.title

    const viewButton = document.createElement('button')
    viewButton.type = 'button'
    viewButton.className = 'btn btn-outline-primary btn-sm'
    viewButton.dataset.id = post.id
    viewButton.dataset.bsToggle = 'modal'
    viewButton.dataset.bsTarget = '#modal'
    viewButton.textContent = 'Просмотр'

    viewButton.dataset.title = post.title
    viewButton.dataset.description = post.description
    viewButton.dataset.link = post.link

    postItem.appendChild(postLink)
    postItem.appendChild(viewButton)
    postsList.appendChild(postItem)
  })

  postsContainer.innerHTML = ''
  postsContainer.appendChild(postsList)
}

const renderStaticTexts = (elements, i18nInstance) => {
  document.querySelector('h1.display-3').textContent = i18nInstance.t('app.title')
  document.querySelector('p.lead').textContent = i18nInstance.t('app.description')
  document.querySelector('label[for="url-input"]').textContent = i18nInstance.t('form.label')
  document.querySelector('#url-input').placeholder = i18nInstance.t('form.placeholder')
  document.querySelector('button[type="submit"]').textContent = i18nInstance.t('app.submit')
  document.querySelector('p.text-secondary').textContent = i18nInstance.t('app.example')
}

const setupModalHandlers = (state) => {
  document.addEventListener('click', (e) => {
    const viewButton = e.target.closest('button[data-id]')

    if (!viewButton) return

    const postId = viewButton.dataset.id
    const postTitle = viewButton.dataset.title
    const postDescription = viewButton.dataset.description
    const postLink = viewButton.dataset.link

    const modalTitle = document.querySelector('.modal-title')
    const modalBody = document.querySelector('.modal-body')
    const modalLink = document.querySelector('.full-article')

    if (modalTitle) {
      modalTitle.textContent = postTitle || 'Без названия'
    }

    if (modalBody) {
      modalBody.textContent = postDescription || 'Нет описания'
    }

    if (modalLink) {
      modalLink.href = postLink || '#'
    }

    if (postId && !state.ui.readPosts.includes(postId)) {
      state.ui.readPosts.push(postId)
    }
  })
}

const createView = (container, onSubmit, i18nInstance) => {
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
    if (path === 'ui.lng') {
      i18nInstance.changeLanguage(state.ui.lng)
        .then(() => {
          renderStaticTexts(elements, i18nInstance)
          if (state.process.error || state.form.success) {
            renderFeedback(elements, state.process.error, state.form.success, i18nInstance)
          }
        })
    }

    if (path === 'process.state') {
      handleFormState(elements, state.process.state)
    }

    if (path === 'process.error' || path === 'form.success') {
      renderFeedback(elements, state.process.error, state.form.success, i18nInstance)
    }

    if (path === 'form.url') {
      renderUrl(elements, state.form.url)
    }

    if (path === 'data.feeds') {
      renderFeeds(container, state.data.feeds)
    }

    if (path === 'data.posts' || path === 'ui.readPosts') {
      renderPosts(container, state.data.posts, state.ui.readPosts)
    }
  })

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const url = formData.get('url')

    state.process.error = null
    state.form.success = false
    state.form.url = url

    if (onSubmit) {
      onSubmit({ url }, state, i18nInstance)
    }
  })

  elements.input.addEventListener('input', (e) => {
    state.form.url = e.target.value
    state.process.error = null
    state.form.success = false
    state.process.state = 'filling'
  })

  setupModalHandlers(state)

  return { elements, state }
}

export { createView }
