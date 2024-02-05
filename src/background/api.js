
const host = "http://localhost:3000"

const api = {
    async query() {
        try {
            const response = await fetch(`${host}/bookmark`, {
                method: 'GET'
            })
            return response;
        }
        catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    },
    async update(updateInfo, succesCallback) {
        try {
            const response = await fetch(`${host}/bookmark`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: updateInfo.id,
                    name: updateInfo.name,
                    url: updateInfo.url,
                    parent_id: updateInfo.parent_id
                }),

            })
            return response;
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    },
    async delete(id) {
        try {

            const response = await fetch(`${host}/bookmark/delete/${id}`, {
                method: 'POST'
            })
            return response;
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
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
                    date_added: bookmark.dateAdded
                })
            })
            return response;
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }
}

