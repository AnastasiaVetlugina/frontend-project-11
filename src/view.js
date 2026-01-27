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

const renderFeedback = (elements, error, success) => {
  elements.feedback.textContent = error || success || ''
  
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
const createView = (container, onSubmit) => {
  const elements = {
    form: container.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitBtn: document.querySelector('button[type="submit"]'),
  }

  const initialState = {
    process: {
      state: 'filling', // filling, validating, invalid, valid, submitting
      error: null,
    },
    form: {
      url: '',
      success: null,
    },
    data: {
      feeds: [],
    },
  }
  const state = onChange(initialState, (path) => {
    
    if (path === 'process.state') {
      handleFormState(elements, state.process.state)
    }
    if (path === 'process.error' || path === 'form.success') {
      renderFeedback(elements, state.process.error, state.form.success)
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
    state.form.success = null
    state.form.url = url
    
    if (onSubmit) {
      onSubmit({ url }, state)
    }
  })

  elements.input.addEventListener('input', (e) => {
    state.form.url = e.target.value
    state.process.error = null
    state.form.success = null
    state.process.state = 'filling'
  })

  return { elements, state }
}

export { createView }