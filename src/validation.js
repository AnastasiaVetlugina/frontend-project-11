import * as yup from 'yup'

const createSchema = (existingFeedUrls = []) => {
  return yup.object({
    url: yup
      .string()
      .required()
      .url()
      .notOneOf(existingFeedUrls, 'duplicate'),
  })
}

const validateUrl = (url, existingFeedUrls = []) => {
  const schema = createSchema(existingFeedUrls)
  return schema.validate({ url }, { abortEarly: false })
}

export { validateUrl }
