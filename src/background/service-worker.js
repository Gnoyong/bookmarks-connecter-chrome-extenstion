importScripts('./api.js');

let changelog = []
let history = []
let config = {}

const storage = {
    initStorageCache: chrome.storage.local.get().then((items) => {
        changelog = [...items.changelog]
        config = { ...items.config }
        history = [...items.history]
        dateModifiedMap.data = new Map(items.dateModifiedList)
    }),
    async get(field) {
        const items = await chrome.storage.local.get(field)
        return items['field']
    },
}

const dateModifiedMap = {
    data: null,
    lock: false,
    async set(key, value) {
        try {
            await storage.initStorageCache
            if (this.lock) {
                while (this.lock) {
                    await sleep(50)
                }
            }
            this.lock = true
            if (this.data.size > 1000) {
                throw new Error('状态数量异常')
            }
            this.data.set(String(key), value)
            let dateModifiedList = []
            this.data.forEach((v, k) => {
                dateModifiedList.push([k, v])
            });
            await chrome.storage.local.set({ dateModifiedList: [...dateModifiedList] })
            console.log('set', key, value);
        } catch (err) {
            console.error('Error when save dateModifiedMap:', err);
        } finally {
            this.lock = false
        }
    },
    async delete(key) {
        try {
            await storage.initStorageCache
            if (this.lock) {
                while (this.lock) {
                    await sleep(50)
                }
            }
            this.lock = true
            this.data.delete(String(key))
            let dateModifiedList = []
            this.data.forEach((v, k) => {
                dateModifiedList.push([k, v])
            });
            await chrome.storage.local.set({ dateModifiedList: [...dateModifiedList] })
        } catch (err) {
            console.error('Error when delete the key of dateModifiedMap:', err);
        } finally {
            this.lock = false
        }
    }

}

function saveToStoreage() {
    chrome.storage.local.set({ changelog: [...changelog], history: [...history] })
}

const Types = {
    CHANGED: 'changed',
    MOVED: 'moved',
    REMOVED: 'removed',
    CREATED: 'created'
};

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'config')
            config = { ...newValue }
    }
});

chrome.bookmarks.onChanged.addListener(
    (id, info) => {
        changelog.push({ type: Types.CHANGED, id, info })
        history.push({ type: Types.CHANGED, id, info })
        dateModifiedMap.set(id, { dateModified: Date.now(), deleted: 0 })
        saveToStoreage()
    }
)

chrome.bookmarks.onMoved.addListener(
    (id, info) => {
        changelog.push({ type: Types.MOVED, id, info })
        history.push({ type: Types.MOVED, id, info })
        dateModifiedMap.set(id, { dateModified: Date.now(), deleted: 0 })
        saveToStoreage()
    }
)

chrome.bookmarks.onRemoved.addListener(
    (id, info) => {
        changelog.push({ type: Types.REMOVED, id, info })
        history.push({ type: Types.REMOVED, id, info })
        dateModifiedMap.set(id, { dateModified: Date.now(), deleted: 1 })
        saveToStoreage()
    }
)

chrome.bookmarks.onCreated.addListener(
    (id, bookmark) => {
        changelog.push({ type: Types.CREATED, id, info: bookmark })
        history.push({ type: Types.CREATED, id, info: bookmark })
        console.log('onCreated set', id, { dateModified: Date.now(), deleted: 0 });
        dateModifiedMap.set(id, { dateModified: Date.now(), deleted: 0 })
        saveToStoreage()
    },
)

forwardSync = async () => {
    while (changelog[0] && config.sync.enable) {
        let log = changelog[0]
        try {
            if (log.type === Types.CHANGED) {
                let response = await api.update({
                    id: log.id,
                    name: log.info.title,
                    url: log.info.url
                })
                if (!response.message == "ok") {
                    throw Error('error')
                }
            } else if (log.type === Types.MOVED) {
                let response = await api.update({ id: log.id, parent_id: log.info.parentId })
                if (!response.message == "ok") {
                    throw Error('error')
                }
            } else if (log.type === Types.REMOVED) {
                let response = await api.delete(log.id)
                if (!response.message == "ok") {
                    throw Error('error')
                }
            } else if (log.type === Types.CREATED) {
                let response = await api.add({ id: log.id, ...log.info });
                if (!response.message == "ok") {
                    throw Error('error')
                }
            }
            changelog.shift()
            await saveToStoreage()
        } catch (error) {
            await sleep(config.sync.retryInterval)
        }
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request);
        if (request.command === "doubleSync") {
            sendResponse({ message: "ok" });
            doubleSync()
        }
    }
);

const doubleSync = async () => {
    chrome.storage.local.get().then((items) => {
        let dateModifiedList;
        dateModifiedList = new Map(items.dateModifiedList);
        api.query()
            .then((response) => response.json())
            .then(json => {
                const onlineData = new Map();
                json.result.forEach((element) => {
                    if (!element.chrome_id && !element.deleted) {
                        console.log("数据库新增了节点", element);
                        chrome.bookmarks.create({
                            parentId: String(element.parent_id),
                            title: element.name,
                            url: element.url
                        }, (node) => {
                            api.updateChromeId(element.id, node.id)
                                .then(response => response.json())
                                .then(json => {
                                    if (json.code != 2000) throw Error('出错了')
                                    dateModifiedMap.set(node.id, { dateModified: element.date_modified, deleted: 0 })
                                })
                        })
                        return
                    }
                    onlineData.set(element.chrome_id, { dateModified: element.date_modified, deleted: element.deleted });
                });
                // 上传新增节点
                dateModifiedList.forEach(async (value, key) => {
                    key = String(key)
                    if (!value) {
                        console.log(key, value);
                    }
                    if (value.deleted) {
                        return
                    }
                    if (!onlineData.has(String(key))) {
                        try {
                            const node = await chrome.bookmarks.get(String(key))
                            console.log("需要上传节点", key, node);
                            let response = await api.add({ ...node[0], dateModified: value.dateModified });
                            if (!response.message == "ok") {
                                throw Error('error')
                            }
                        } catch (err) {
                            dateModifiedMap.delete(key)
                            await saveToStoreage()
                            console.error("不存在的节点", key);
                            return
                        }
                    }
                });

                onlineData.forEach(async (value, key) => {
                    key = String(key)
                    const local = dateModifiedList.get(key)
                    if (local.deleted && local.dateModified > value.dateModified) {
                        console.log("本地删除了节点", key);
                        api.delete(key).then(response => response.json()).then(json => {
                            if (json.code != 2000)
                                console.log('出错了');
                        })
                    } else if (local.dateModified > value.dateModified) {
                        const node = await chrome.bookmarks.get(String(key))
                        console.log("本地更新了节点", key);
                        const response = await api.update({ ...node[0], dateModified: local.dateModified })
                        const json = await response.json()
                        if (json.code != 2000) {
                            throw new Error('出错了');
                        }
                    } else if (local.dateModified < value.dateModified) {
                        if (local.deleted) return
                        console.log("数据库更新了节点", key);
                    }
                });

            });
    });
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const initialize = async () => {
    try {
        await storage.initStorageCache
    } catch (e) {
        console.error('load cache faild', e);
    }
    const loop = async () => {
        await forwardSync()
        setTimeout(loop, 3000);
    }
    loop();
}

initialize()