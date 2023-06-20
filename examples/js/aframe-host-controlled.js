/* global AFRAME, NAF */
AFRAME.registerComponent('host-controlled', {
  schema: {
    isHost: {
      type: 'boolean',
      default: false
    }
  },

  events: {
    click: function (evt) {
      if (this.data.isHost) {
        const data = {
          id: evt.target.id
        };
        const dataType = 'click';
        NAF.connection.broadcastDataGuaranteed(dataType, data);
      }
    }
  },

  init: function () {
    const dataType = 'click';
    NAF.connection.subscribeToDataChannel(dataType, (senderId, dataType, data, targetObj) => {
      console.warn(data);
      this.simulateClick(data.id);
    });
  },

  simulateClick: function (id) {
    let element = document.getElementById(id);
    let event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
  }
});
