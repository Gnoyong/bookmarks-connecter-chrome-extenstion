importScripts("/api.js")


let changelog
const initStorageCache = chrome.storage.sync.get().then((items) => {
    console.log(items);
    changelog = [...items.changelog]
});

saveToStoreage = async () => {
    await chrome.storage.sync.set({ changelog: [...changelog] })
}

const Types = {
    CHANGED: 'changed',
    MOVED: 'moved',
    REMOVED: 'removed',
    CREATED: 'created'
};

chrome.action.onClicked.addListener(
    (tab) => {
    }
)

chrome.bookmarks.onChanged.addListener(
    (id, info) => {
        changelog.push({ type: Types.CHANGED, id, info })
        saveToStoreage()
    }
)

chrome.bookmarks.onMoved.addListener(
    (id, info) => {
        changelog.push({ type: Types.MOVED, id, info })
        saveToStoreage()
    }
)

chrome.bookmarks.onRemoved.addListener(
    (id, info) => {
        changelog.push({ type: Types.REMOVED, id, info })
        saveToStoreage()
    }
)

chrome.bookmarks.onCreated.addListener(
    (id, bookmark) => {
        changelog.push({ type: Types.CREATED, id, info: bookmark })
        saveToStoreage()
    },
)

forwardSync = async () => {
    while (changelog[0]) {
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
            await sleep(60000)
        }
    }
}

sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

initialize = async () => {
    console.log('initialize');
    try {
        await initStorageCache
    } catch (e) {
        console.error('load cache faild');
    }
    console.log('changelog', changelog);
    loop = async () => {
        await forwardSync()
        setTimeout(loop, 1000);
    }
    loop();
}

initialize()