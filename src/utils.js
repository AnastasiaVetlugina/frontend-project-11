import axios from 'axios'

export const fetchRssFeed = (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`

  return axios.get(proxyUrl, { timeout: 10000 })
    .then((response) => {
      if (!response.data.contents) {
        throw new Error('Ошибка при загрузке RSS')
      }
      return response.data.contents
    })
}
