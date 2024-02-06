importScripts('./api.js');

let changelog = []
let history = []
let config = {}

const initStorageCache = chrome.storage.sync.get().then((items) => {
    changelog = [...items.changelog]
    config = {...items.config}
    history = [...items.history]
});



saveToStoreage = async () => {
    await chrome.storage.sync.set({ changelog: [...changelog], history: [...history] })
}

const Types = {
    CHANGED: 'changed',
    MOVED: 'moved',
    REMOVED: 'removed',
    CREATED: 'created'
};

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if(key === 'config')
            config = {...newValue}
    }
  });

chrome.bookmarks.onChanged.addListener(
    (id, info) => {
        changelog.push({ type: Types.CHANGED, id, info })
        history.push({ type: Types.CHANGED, id, info })
        saveToStoreage()
    }
)

chrome.bookmarks.onMoved.addListener(
    (id, info) => {
        changelog.push({ type: Types.MOVED, id, info })
        history.push({ type: Types.MOVED, id, info })
        saveToStoreage()
    }
)

chrome.bookmarks.onRemoved.addListener(
    (id, info) => {
        changelog.push({ type: Types.REMOVED, id, info })
        history.push({ type: Types.REMOVED, id, info })
        saveToStoreage()
    }
)

chrome.bookmarks.onCreated.addListener(
    (id, bookmark) => {
        changelog.push({ type: Types.CREATED, id, info: bookmark })
        history.push({ type: Types.CREATED, id, info: bookmark })
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

sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

initialize = async () => {
    try {
        await initStorageCache
    } catch (e) {
        console.error('load cache faild', e);
    }
    loop = async () => {
        await forwardSync()
        setTimeout(loop, 3000);
    }
    loop();
}

initialize()