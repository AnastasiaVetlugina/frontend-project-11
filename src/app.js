import { validateUrl } from './validation.js'
import { createView } from './view.js'

const initApp = (container) => {
  const handleSubmit = (formData, state) => {
    state.process.state = 'validating'
    state.process.error = null
    state.form.success = null

    validateUrl(formData.url, state.data.feeds)
      .then(() => {
        state.process.state = 'valid'
        state.process.error = null
        state.process.state = 'submitting'
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, 1000)
        })
      })
      .then(() => {
        state.data.feeds.push(formData.url)
        state.process.state = 'filling'
        state.form.url = ''
        state.process.error = null
        state.form.success = 'RSS успешно загружен'
      })
      .catch((error) => {
        state.process.state = 'invalid'
        
        if (error.name === 'ValidationError') {
          state.process.error = error.errors[0]
        } else {
          state.process.error = 'Ошибка сети или сервера'
        }
        
        state.form.success = null
      })
  }

  const view = createView(container, handleSubmit)
  
  return view
}

export { initApp }