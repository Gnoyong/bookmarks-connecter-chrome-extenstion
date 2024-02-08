const host = 'http://localhost:3000'

const api = {
  async query() {
    try {
      const response = await fetch(`${host}/bookmark`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error)
    }
  },
  async update(updateInfo) {
    try {
      const response = await fetch(`${host}/bookmark`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: updateInfo.id,
          name: updateInfo.title,
          url: updateInfo.url,
          parentId: updateInfo.parentId,
          dateModified: updateInfo.dateModified
        })
      })
      return response
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error)
    }
  },
  async updateChromeId(id, chromeId) {
    try {
      const response = await fetch(`${host}/bookmark/${id}/chromeId`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chromeId: chromeId
        })
      })
      return response
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error)
    }
  },
  async delete(id) {
    try {
      const response = await fetch(`${host}/bookmark/delete/${id}`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error)
    }
  },
  async add(bookmark) {
    try {
      const response = await fetch(`${host}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: bookmark.id,
          name: bookmark.title,
          url: bookmark.url,
          parent_id: bookmark.parentId,
          date_added: bookmark.dateAdded,
          date_modified: bookmark.dateModified
        })
      })
      return response
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error)
    }
  },
  upload(formData) {
    return fetch(`${host}/upload`, {
      method: 'POST',
      body: formData
    })
  },
  initialize() {
    return fetch(`${host}/bookmark/init`, {
      method: 'POST'
    })
  }
}
