export default {
    setUser: function(d) {
        d.__expired = new Date().getTime() + 1000 * 60 * 30;
        global.setLocalStore('IWJW_USER', d);
    },

    getUser: function() {
        let data = global.getLocalStore('IWJW_USER') || null;
        return data;
    },

    clear: function() {
        global.setLocalStore('IWJW_USER', null);
    }
}