import * as yup from 'yup'

const createSchema = (existingFeeds = []) => {
  return yup.object({
    url: yup
      .string()
      .required('Поле не должно быть пустым')
      .url('Ссылка должна быть валидным URL')
      .test(
        'is-unique',
        'RSS уже существует',
        (value) => !existingFeeds.includes(value)
      )
      .test(
        'is-rss',
        'Это не RSS ссылка',
        (value) => {
          return new Promise((resolve) => {
            if (!value) {
              resolve(false)
              return
            }
            
            const rssPatterns = [
              /\.xml$/i,
              /\/rss/i,
              /\/feed/i,
              /\.rss$/i,
              /feed=/i,
              /format=rss/i,
            ]
            
            const isRss = rssPatterns.some(pattern => pattern.test(value))
            resolve(isRss)
          })
        }
      ),
  })
}

const validateUrl = (url, existingFeeds = []) => {
  const schema = createSchema(existingFeeds)
  return schema.validate({ url }, { abortEarly: false })
}

export { validateUrl }