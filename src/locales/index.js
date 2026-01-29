// src/locales/index.js
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
        required: 'Field must not be empty',
        url: 'Link must be a valid URL',
        notRss: 'This is not an RSS link',
        duplicate: 'RSS already exists',
        network: 'Network or server error',
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
        required: 'Поле не должно быть пустым',
        url: 'Ссылка должна быть валидным URL',
        notRss: 'Это не RSS ссылка',
        duplicate: 'RSS уже существует',
        network: 'Ошибка сети или сервера',
      },
    },
  },
}