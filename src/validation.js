import * as yup from 'yup'

const createSchema = (existingFeedUrls = [], i18nInstance) => {
  yup.setLocale({
    string: {
      required: () => i18nInstance.t('errors.required'),
      url: () => i18nInstance.t('errors.url'),
    },
  })

  return yup.object({
    url: yup
      .string()
      .required()
      .url()
      .test(
        'is-unique',
        i18nInstance.t('errors.duplicate'),
        value => !existingFeedUrls.includes(value),
      )
      .test(
        'is-rss',
        i18nInstance.t('errors.notRss'),
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
        },
      ),
  })
}

const validateUrl = (url, existingFeedUrls = [], i18nInstance) => {
  const schema = createSchema(existingFeedUrls, i18nInstance)
  return schema.validate({ url }, { abortEarly: false })
}

export { validateUrl }
