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

const renderUrl = (elements, url) => {
  elements.input.value = url
}

const renderStaticTexts = (elements, i18nInstance) => {
  document.querySelector('h1.display-3').textContent = i18nInstance.t('app.title')
  document.querySelector('p.lead').textContent = i18nInstance.t('app.description')
  document.querySelector('label[for="url-input"]').textContent = i18nInstance.t('form.label')
  document.querySelector('#url-input').placeholder = i18nInstance.t('form.placeholder')
  document.querySelector('button[type="submit"]').textContent = i18nInstance.t('app.submit')
  document.querySelector('p.text-secondary').textContent = i18nInstance.t('app.example')
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
    },
  }

  const state = onChange(initialState, (path) => {
    if (path === 'ui.lng') {
      i18nInstance.changeLanguage(state.ui.lng)
        .then(() => {
          renderStaticTexts(elements, i18nInstance)
          if (state.process.error || state.form.success) {
            renderFeedback(
              elements, 
              state.process.error, 
              state.form.success, 
              i18nInstance
            )
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

  return { elements, state }
}

export { createView }