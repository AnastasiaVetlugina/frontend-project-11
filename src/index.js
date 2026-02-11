import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { initApp } from './app.js'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('main')
  initApp(container)
})
