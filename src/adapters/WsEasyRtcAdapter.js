/* global NAF */
const NoOpAdapter = require('./NoOpAdapter');

class WsEasyRtcInterface extends NoOpAdapter {

  constructor(easyrtc) {
    super();

    this.easyrtc = easyrtc || window.easyrtc;
    this.app = 'default';
    this.room = 'default';

    this.connectedClients = [];

    this.serverTimeRequests = 0;
    this.timeOffsets = [];
    this.avgTimeOffset = 0;
    console.warn("WsEasyRtcAdapter: constructor called")
  }

  setServerUrl(url) {
    this.serverUrl = url;
    this.easyrtc.setSocketUrl(url);
    console.warn("WsEasyRtcAdapter: sertServerUrl")
  }

  setApp(appName) {
    this.app = appName;
    console.warn("WsEasyRtcAdapter: setApp")
  }

  setRoom(roomName) {
    this.room = roomName;
    this.easyrtc.joinRoom(roomName, null);
    console.warn("WsEasyRtcAdapter: setRoom")
  }

  setWebRtcOptions(options) {
    // No webrtc support
  }

  setServerConnectListeners(successListener, failureListener) {
    this.connectSuccess = successListener;
    this.connectFailure = failureListener;
    console.warn("WsEasyRtcAdapter: setServerConnectListeners")
  }

  setRoomOccupantListener(occupantListener){
    this.easyrtc.setRoomOccupantListener(function(roomName, occupants, primary) {
      occupantListener(occupants);
    });
    console.warn("WsEasyRtcAdapter: setRoomOccupantListener")
  }

  setDataChannelListeners(openListener, closedListener, messageListener) {
    this.openListener = openListener;
    this.closedListener = closedListener;
    this.easyrtc.setPeerListener(messageListener);
    console.warn("WsEasyRtcAdapter: setDataChannelListeners")
  }

  updateTimeOffset() {
    const clientSentTime = Date.now() + this.avgTimeOffset;
    console.warn("WsEasyRtcAdapter: updateTimeOffset")
    return fetch(document.location.href, { method: "HEAD", cache: "no-cache" })
      .then(res => {
        var precision = 1000;
        var serverReceivedTime = new Date(res.headers.get("Date")).getTime() + (precision / 2);
        var clientReceivedTime = Date.now();
        var serverTime = serverReceivedTime + ((clientReceivedTime - clientSentTime) / 2);
        var timeOffset = serverTime - clientReceivedTime;

        this.serverTimeRequests++;

        if (this.serverTimeRequests <= 10) {
          this.timeOffsets.push(timeOffset);
        } else {
          this.timeOffsets[this.serverTimeRequests % 10] = timeOffset;
        }

        this.avgTimeOffset = this.timeOffsets.reduce((acc, offset) => acc += offset, 0) / this.timeOffsets.length;

        if (this.serverTimeRequests > 10) {
          setTimeout(() => this.updateTimeOffset(), 5 * 60 * 1000); // Sync clock every 5 minutes.
        } else {
          this.updateTimeOffset();
        }
      });
  }

  connect() {
    console.warn("WsEasyRtcAdapter: connect")
    Promise.all([
      this.updateTimeOffset(),
      new Promise((resolve, reject) => {
        this.easyrtc.connect(this.app, resolve, reject);
      })
    ]).then(([_, clientId]) => {
      this.connectSuccess(clientId);
    }).catch(this.connectFailure);
  }

  shouldStartConnectionTo(clientId) {
    console.warn("WsEasyRtcAdapter: shouldStartConnectionTo")
    return true;
  }

  startStreamConnection(clientId) {
    this.connectedClients.push(clientId);
    this.openListener(clientId);
    console.warn("WsEasyRtcAdapter: startStreamConnection")
  }

  closeStreamConnection(clientId) {
    var index = this.connectedClients.indexOf(clientId);
    if (index > -1) {
      this.connectedClients.splice(index, 1);
    }
    this.closedListener(clientId);
    console.warn("WsEasyRtcAdapter: closeStreamConnection")
  }

  sendData(clientId, dataType, data) {
    this.easyrtc.sendDataWS(clientId, dataType, data);
    console.warn("WsEasyRtcAdapter: closeStreamConnection")
  }

  sendDataGuaranteed(clientId, dataType, data) {
    this.sendData(clientId, dataType, data);
    console.warn("WsEasyRtcAdapter: closeStreamConnection")
  }

  broadcastData(dataType, data) {
    var destination = {targetRoom: this.room};
    this.easyrtc.sendDataWS(destination, dataType, data);
    console.warn("WsEasyRtcAdapter: broadcastData")
  }

  broadcastDataGuaranteed(dataType, data) {
    this.broadcastData(dataType, data);
    console.warn("WsEasyRtcAdapter: broadcastDataGuaranteed")
  }

  getConnectStatus(clientId) {
    var connected = this.connectedClients.indexOf(clientId) != -1;
    console.warn("WsEasyRtcAdapter: getConnectStatus")
    if (connected) {
      return NAF.adapters.IS_CONNECTED;
    } else {
      return NAF.adapters.NOT_CONNECTED;
    }

  }

  getServerTime() {
    console.warn("WsEasyRtcAdapter: getServerTime")
    return Date.now() + this.avgTimeOffset;
  }

  disconnect() {
    console.warn("WsEasyRtcAdapter: disconnect")
    this.easyrtc.disconnect();
  }
}

module.exports = WsEasyRtcInterface;