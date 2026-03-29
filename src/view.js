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
    if (error.name === 'ValidationError') {
      message = i18nInstance.t(error.errors[0])
    } else if (error.message.includes('invalidRss')) {
      message = i18nInstance.t('errors.notRss')
    } else if (error.message.includes('timeout') || error.message.includes('Network')) {
      message = i18nInstance.t('errors.network')
    } else {
      message = i18nInstance.t('errors.unknown')
    }
  } else if (success) {
    message = i18nInstance.t('app.success')
  }

  elements.feedback.textContent = message
  elements.feedback.classList.remove('text-danger', 'text-success')
  elements.input.classList.remove('is-invalid')

  if (error) {
    elements.feedback.classList.add('text-danger')
    elements.input.classList.add('is-invalid')
  } else if (success) {
    elements.feedback.classList.add('text-success')
  }
}

const renderFeeds = (container, feeds) => {
  const feedsContainer = container.querySelector('.feeds .list-group')
  const feedsCard = container.querySelector('.feeds .card')

  if (feeds.length === 0) {
    feedsContainer.innerHTML = ''
    if (feedsCard) {
      feedsCard.classList.add('d-none')
    }
    return
  }

  if (feedsCard) {
    feedsCard.classList.remove('d-none')
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
  const postsCard = container.querySelector('.posts .card')

  if (posts.length === 0) {
    postsContainer.innerHTML = ''
    if (postsCard) {
      postsCard.classList.add('d-none')
    }
    return
  }

  if (postsCard) {
    postsCard.classList.remove('d-none')
  }

  const postsList = document.createElement('ul')
  postsList.className = 'list-group border-0 rounded-0'

  const sortedPosts = [...posts].reverse()

  sortedPosts.forEach((post) => {
    const isRead = readPosts.includes(post.id)
    const linkClass = isRead ? 'link-secondary' : 'fw-bold'

    const postItem = document.createElement('li')
    postItem.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0'

    const postLink = document.createElement('a')
    postLink.href = post.link
    postLink.className = linkClass
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

export const renderModal = (postTitle, postDescription, postLink) => {
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
}

export const createWatchedState = (initialState, container, elements, i18nInstance) => {
  return onChange(initialState, (path) => {
    if (path === 'process.state') {
      handleFormState(elements, initialState.process.state)
    }

    if (path === 'process.error' || path === 'form.success') {
      renderFeedback(elements, initialState.process.error, initialState.form.success, i18nInstance)
    }

    if (path === 'form.url') {
      elements.input.value = initialState.form.url
    }

    if (path === 'data.feeds') {
      renderFeeds(container, initialState.data.feeds)
    }

    if (path === 'data.posts' || path === 'ui.readPosts') {
      renderPosts(container, initialState.data.posts, initialState.ui.readPosts)
    }

    if (path === 'ui.lng') {
      i18nInstance.changeLanguage(initialState.ui.lng)
        .then(() => {
          renderStaticTexts(elements, i18nInstance)
          if (initialState.process.error || initialState.form.success) {
            renderFeedback(elements, initialState.process.error, initialState.form.success, i18nInstance)
          }
        })
    }
  })
}
