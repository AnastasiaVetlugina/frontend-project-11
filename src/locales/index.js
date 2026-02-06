export default {
  en: {
    translation: {
      app: {
        title: 'RSS Aggregator',
        description: 'Start reading RSS today! It is easy, it is beautiful.',
        example: 'Example: https://lorem-rss.hexlet.app/feed',
        submit: 'Add',
        success: 'RSS successfully loaded',
      },
      form: {
        label: 'RSS Link',
        placeholder: 'link RSS',
      },
      errors: {
        required: 'Should not be empty',
        url: 'The link must be a valid URL',
        notRss: 'Resource does not contain valid RSS',
        duplicate: 'RSS already exists',
        network: 'Network error',
      },
    },
  },
  ru: {
    translation: {
      app: {
        title: 'RSS агрегатор',
        description: 'Начните читать RSS сегодня! Это легко, это красиво.',
        example: 'Пример: https://lorem-rss.hexlet.app/feed',
        submit: 'Добавить',
        success: 'RSS успешно загружен',
      },
      form: {
        label: 'Ссылка RSS',
        placeholder: 'ссылка RSS',
      },
      errors: {
        required: 'Не должно быть пустым',
        url: 'Ссылка должна быть валидным URL',
        notRss: 'Ресурс не содержит валидный RSS',
        duplicate: 'RSS уже существует',
        network: 'Ошибка сети',
      },
    },
  },
}
