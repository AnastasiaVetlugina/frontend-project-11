import { nanoid } from 'nanoid'

export const parseRssFeed = (xmlString) => {
  if (typeof DOMParser === 'undefined') {
    throw new Error('notRss')
  }

  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml')

  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    throw new Error('notRss')
  }

  const channel = xmlDoc.querySelector('channel')
  if (!channel) {
    throw new Error('notRss')
  }

  const feed = {
    id: nanoid(),
    title: channel.querySelector('title')?.textContent?.trim() || '',
    description: channel.querySelector('description')?.textContent?.trim() || '',
  }

  const items = xmlDoc.querySelectorAll('item')
  const posts = Array.from(items).map(item => ({
    id: nanoid(),
    title: item.querySelector('title')?.textContent?.trim() || '',
    description: item.querySelector('description')?.textContent?.trim() || '',
    link: item.querySelector('link')?.textContent?.trim() || '',
  }))

  if (posts.length === 0) {
    throw new Error('notRss')
  }

  return { feed, posts }
}
