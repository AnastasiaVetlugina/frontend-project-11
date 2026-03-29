import * as yup from 'yup'

yup.setLocale({
  mixed: {
    required: 'errors.required',
  },
  string: {
    url: 'errors.url',
  },
})

const createSchema = (existingFeedUrls = []) => {
  return yup.object({
    url: yup
      .string()
      .required()
      .url()
      .notOneOf(existingFeedUrls, 'errors.duplicate'),
  })
}

const validateUrl = (url, existingFeedUrls = []) => {
  const schema = createSchema(existingFeedUrls)
  return schema.validate({ url }, { abortEarly: false })
}

export { validateUrl }
