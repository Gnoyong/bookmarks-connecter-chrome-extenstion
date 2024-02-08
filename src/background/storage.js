// eslint-disable-next-line no-unused-vars
const storage = (function () {
  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  const nodeStatusMap = {
    value: new Map(),
    lock: false,
    async set(id, dateModified, deleted) {
      this.check(id, dateModified, deleted)
      try {
        if (this.lock) {
          while (this.lock) {
            await sleep(50)
          }
        }
        this.lock = true
        if (this.value.size > 1000) {
          throw new Error('状态数量异常')
        }
        this.value.set(id, {
          dateModified,
          deleted
        })
        this.save()
      } catch (err) {
        console.error('Error when save dateModifiedMap:', err)
      } finally {
        this.lock = false
      }
    },
    async delete(key) {
      try {
        if (this.lock) {
          while (this.lock) {
            await sleep(50)
          }
        }
        this.lock = true
        this.value.delete(String(key))
        this.save()
      } catch (err) {
        console.error('Error when delete the key of dateModifiedMap:', err)
      } finally {
        this.lock = false
      }
    },
    async save() {
      let dateModifiedList = []
      this.value.forEach((v, k) => {
        dateModifiedList.push([k, v])
      })
      await chrome.storage.local.set({ dateModifiedList: [...dateModifiedList] })
    },
    async init(list) {
      const processed = []
      list.forEach((item) => {
        this.check(item.id, item.dateModified, item.deleted)
        processed.push([item.id, { dateModified: item.dateModified, deleted: item.deleted }])
      })
      await chrome.storage.local.set({ dateModifiedList: [...processed] })
      this.value = new Map(processed)
    },
    check(id, dateModified, value) {
      if (!id || !dateModified || typeof value === 'undefined') {
        throw new Error('缺少关键数据')
      }
      if (typeof id !== 'string') {
        throw new Error('id must be string')
      }
    }
  }

  return {
    initialize: async function () {
      const items = await chrome.storage.local.get()
      this.changelog = [...items.changelog]
      this.config = { ...items.config }
      this.history = [...items.history]
      this.nodeStatusMap.value = new Map(items.dateModifiedList)
    },
    changelog: [],
    history: [],
    config: {},
    nodeStatusMap,
    saveAll: function () {
      this.nodeStatusMap.save()
      chrome.storage.local.set({
        changelog: [...this.changelog],
        history: [...this.history],
        config: { ...this.config }
      })
    }
  }
})()
