/* global AFRAME */
AFRAME.registerComponent('video-controls', {
  init: function () {
    this.videoSrc = this.el.getAttribute('material').src;
  },
  events: {
    click: function (evt) {
      const isPlaying = !!(
        this.videoSrc.currentTime > 0 &&
        !this.videoSrc.paused &&
        !this.videoSrc.ended &&
        this.videoSrc.readyState > 2
      );
      if (isPlaying) {
        this.videoSrc.pause();
      } else {
        this.videoSrc.play();
      }
    }
  }
});
