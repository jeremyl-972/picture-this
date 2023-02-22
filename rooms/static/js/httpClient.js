const send_request = async (url, postData) => {
    try {
        res = postData? await axios.post(url, postData) : await axios.get(url);
        if (res.status != 200) {
            throw new Error(res.statusText);
        };
        return postData? res.statusText : res.data;
    } catch (error) {
        console.error(error);
        const announcements = document.getElementById('announcements');
        announcements.innerHTML = '';
        const node = document.createTextNode(t('socketio.httpErr'));
        announcements.appendChild(node);
    }
};

const get_words = async (diff_level, lang) => {
    return send_request(`/rooms/get_words/${diff_level}/${lang}`);
};