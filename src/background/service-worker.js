/* global storage, api*/
/* eslint-env node */

// eslint-disable-next-line no-undef
importScripts('./api.js', './storage.js')

const Types = {
  CHANGED: 'changed',
  MOVED: 'moved',
  REMOVED: 'removed',
  CREATED: 'created'
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === 'config') storage.config = { ...newValue }
  }
})

chrome.bookmarks.onChanged.addListener((id, info) => {
  // storage.changelog.push({ type: Types.CHANGED, id, info })
  storage.history.push({ type: Types.CHANGED, id, info })
  storage.nodeStatusMap.set(id, Date.now(), 0)
  storage.saveAll()
})

chrome.bookmarks.onMoved.addListener((id, info) => {
  // storage.changelog.push({ type: Types.MOVED, id, info })
  storage.history.push({ type: Types.MOVED, id, info })
  storage.nodeStatusMap.set(id, Date.now(), 0)
  storage.saveAll()
})

chrome.bookmarks.onRemoved.addListener((id, info) => {
  // storage.changelog.push({ type: Types.REMOVED, id, info })
  storage.history.push({ type: Types.REMOVED, id, info })
  storage.nodeStatusMap.set(id, Date.now(), 1)
  storage.saveAll()
})

chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  // storage.changelog.push({ type: Types.CREATED, id, info: bookmark })
  storage.history.push({ type: Types.CREATED, id, info: bookmark })
  storage.nodeStatusMap.set(id, Date.now(), 0)
  storage.saveAll()
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === 'doubleSync') {
    doubleSync()
    sendResponse({ message: 'ok' })
  } else if (request.command === 'initialize') {
    initializeUserdata().then((code) => sendResponse({ code }))
  } else if (request.command === 'removeDuplicateBookmarks') {
    removeDuplicateBookmarks()
    sendResponse({ code: 2000 })
  }
  return true
})

const removeDuplicateBookmarks = () => {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message)
      return
    }

    const allBookmarks = []

    // 递归遍历书签树
    function traverse(bookmarkNodes) {
      for (let node of bookmarkNodes) {
        if (node.url) {
          // 如果是书签，则将其添加到 allBookmarks 数组中
          allBookmarks.push({ id: node.id, url: node.url })
        } else if (node.children) {
          // 如果是文件夹，则递归遍历其子节点
          traverse(node.children)
        }
      }
    }

    // 遍历书签树
    traverse(bookmarkTreeNodes)

    // 找出重复的书签
    const uniqueBookmarks = {}
    const duplicateBookmarks = []

    allBookmarks.forEach((bookmark) => {
      if (uniqueBookmarks[bookmark.url]) {
        duplicateBookmarks.push(bookmark.id)
      } else {
        uniqueBookmarks[bookmark.url] = true
      }
    })

    // 删除重复的书签
    duplicateBookmarks.forEach((bookmarkId) => {
      chrome.bookmarks.remove(bookmarkId, function () {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message)
          return
        }
        console.log('已删除重复的书签:', bookmarkId)
      })
    })
  })
}

const initializeUserdata = async function () {
  const tree = await chrome.bookmarks.getTree()
  const nodeStatus = []
  const jsonString = JSON.stringify(tree, null, 1)
  const formData = new FormData()
  formData.append('file', new Blob([jsonString]))
  const upload = await api
    .upload(formData)
    .then((response) => response.json())
    .then((json) => {
      return json
    })
  if (upload.code != 2000) {
    return 4001
  }
  const init = await api
    .initialize()
    .then((response) => response.json())
    .then((json) => {
      return json
    })
  if (init.code != 2000) {
    return 4001
  }
  function depthFirstTraversal(parent, node, callback) {
    callback(parent, node)
    node.children &&
      node.children.forEach((child) => {
        depthFirstTraversal(node, child, callback)
      })
  }
  depthFirstTraversal(null, tree[0], (parent, node) => {
    nodeStatus.push({ id: node.id, dateModified: node.dateAdded, deleted: 0 })
  })
  storage.nodeStatusMap.init(nodeStatus)
  return 2000
}

const doubleSync = async () => {
  function action(items) {
    api
      .query()
      .then((response) => response.json())
      .then((json) => sync(json, items))
  }
  function sync(json, items) {
    const localNodeStatus = new Map(items.dateModifiedList)
    const remoteNodeStatus = new Map()
    const remoteNodes = json.result
    remoteNodes.forEach((element) => {
      remoteNodeStatus.set(element.chrome_id, {
        dateModified: element.date_modified,
        deleted: element.deleted
      })
    })
    // 处理本地数据，上传新增数据
    localNodeStatus.forEach(async (value, key) => {
      const chromeId = String(key)
      if (value.deleted) {
        return
      }
      if (!remoteNodeStatus.has(chromeId)) {
        try {
          const node = await chrome.bookmarks.get(chromeId)
          await api.add({ ...node[0], dateModified: value.dateModified })
        } catch (err) {
          console.error('不存在节点，删除异常数据', chromeId)
          storage.nodeStatusMap.delete(chromeId)
          await storage.saveAll()
        }
      }
    })
    // 处理远程数据
    remoteNodes.forEach(async (remoteNode) => {
      const chromeId = remoteNode.chrome_id
      const localStatus = localNodeStatus.get(chromeId)
      if (chromeId == '0' || chromeId == '1') return
      if (localStatus.deleted && remoteNode.deleted) return
      let localNode = null
      try {
        localNode = await chrome.bookmarks.get(chromeId)
      } catch (err) {
        console.error('error when get bookmark:', err)
      }
      if (!localStatus && localNode) {
        console.error('本地节点缺少状态数据', localNode)
        return
      }
      if (!localNode && !localStatus.deleted) {
        console.error('本地状态数据异常', localStatus)
        return
      }
      // 同步远程新增节点
      if (!localStatus && !remoteNode.chrome_id && !remoteNode.deleted) {
        console.log('恢复节点', remoteNode)
        chrome.bookmarks.create(
          {
            parentId: String(remoteNode.parent_id),
            title: remoteNode.name,
            url: remoteNode.url
          },
          (freshNode) => {
            api
              .updateChromeId(remoteNode.id, freshNode.id)
              .then((response) => response.json())
              .then((json) => {
                if (json.code != 2000) throw Error('出错了')
                storage.nodeStatusMap.delete(chromeId)
                storage.nodeStatusMap.set(freshNode.id, {
                  dateModified: remoteNode.date_modified,
                  deleted: remoteNode.deleted
                })
              })
          }
        )
        // 不在处理更新逻辑
        return
      }
      if (localStatus.dateModified > remoteNode.date_modified) {
        if (localStatus.deleted) {
          console.log('本地删除了节点', chromeId)
          api
            .delete(chromeId)
            .then((response) => response.json())
            .then((json) => {
              if (json.code != 2000) console.log('出错了')
            })
        } else {
          console.log('本地更新了节点', chromeId)
          const response = await api.update({
            ...localNode[0],
            dateModified: localStatus.dateModified
          })
          const json = await response.json()
          if (json.code != 2000) {
            throw new Error('出错了')
          }
        }
      } else if (localStatus.dateModified < remoteNode.date_modified) {
        console.log('数据库更新了节点', chromeId)
        if (localStatus.deleted && !remoteNode.deleted) {
          chrome.bookmarks.create(
            {
              parentId: String(remoteNode.parent_id),
              title: remoteNode.name,
              url: remoteNode.url
            },
            (freshNode) => {
              api
                .updateChromeId(remoteNode.id, freshNode.id)
                .then((response) => response.json())
                .then((json) => {
                  if (json.code != 2000) throw Error('出错了')
                  storage.nodeStatusMap.set(freshNode.id, {
                    dateModified: remoteNode.date_modified,
                    deleted: remoteNode.deleted
                  })
                })
            }
          )
        } else {
          if (remoteNode.deleted) {
            try {
              chrome.bookmarks.remove(chromeId)
            } catch (err) {
              console.error('remove bookmarks error:', err)
            }
          } else {
            try {
              chrome.bookmarks.update(chromeId, { title: remoteNode.name, url: remoteNode.url })
            } catch (err) {
              console.error('update bookmarks error:', err)
            }
          }
        }
      }
    })
  }
  chrome.storage.local.get().then((items) => action(items))
}

const initialize = async () => {
  try {
    await storage.initialize()
  } catch (e) {
    console.error('load cache faild', e)
  }
  const loop = async () => {
    if (storage.config.sync.enable) {
      await doubleSync()
    }
    setTimeout(loop, storage.config.sync.retryInterval)
  }
  loop()
}

initialize()
