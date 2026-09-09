// ParallelBgs.js patch
// Fix: AudioManager.findPlayingBgsIndex uses findIndex for correct index lookup.
// Trigger: game plugins.js contains ParallelBgs

(function() {
    function applyPatch() {
        if (typeof AudioManager === 'undefined') return false;
        if (!AudioManager.findPlayingBgsIndex) return false;
        if (AudioManager.__arkParallelBgsPatched) return true;

        AudioManager.findPlayingBgsIndex = function (bgs, startingIndex) {
            return this._allBgsBuffer.findIndex(function(buffer, i) {
                if (i < startingIndex) return false;
                if (!buffer || !buffer._url) return false;
                var url = buffer._url.split('?')[0];
                var bufferName = url.substring(url.lastIndexOf('/') + 1);
                bufferName = bufferName.replace(/\.[^/.]+$/, "");
                return buffer._autoPlay && bufferName === bgs.name;
            });
        };
        AudioManager.__arkParallelBgsPatched = true;
        console.log('[ParallelBgs] findPlayingBgsIndex patched');
        return true;
    }

    var retries = 0;
    var timer = setInterval(function() {
        retries++;
        if (applyPatch() || retries > 100) clearInterval(timer);
    }, 100);
})();
