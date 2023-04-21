const WsEasyRtcAdapter = require("./WsEasyRtcAdapter");
const EasyRtcAdapter = require("./EasyRtcAdapter");
const WebrtcAdapter = require("./naf-webrtc-adapter");
const SocketioAdapter = require('./naf-socketio-adapter');
const CroquetAdapter = require('./naf-croquet-adapter')

class AdapterFactory {
  constructor() {
    this.adapters = {
      "wseasyrtc": WsEasyRtcAdapter,
      "easyrtc": EasyRtcAdapter,
      "socketio": SocketioAdapter,
      "webrtc": WebrtcAdapter,
      "croquet": CroquetAdapter,
    };

    this.IS_CONNECTED = AdapterFactory.IS_CONNECTED;
    this.CONNECTING = AdapterFactory.CONNECTING;
    this.NOT_CONNECTED = AdapterFactory.NOT_CONNECTED;
  }

  register(adapterName, AdapterClass) {
    this.adapters[adapterName] = AdapterClass;
  }

  make(adapterName) {
    var name = adapterName.toLowerCase();
    if (this.adapters[name]) {
      var AdapterClass = this.adapters[name];
      return new AdapterClass();
    } else {
      throw new Error(
        "TEST Adapter: " +
          adapterName +
          " not registered. Please use NAF.adapters.register() to register this adapter."
      );
    }
  }
}

AdapterFactory.IS_CONNECTED = "IS_CONNECTED";
AdapterFactory.CONNECTING = "CONNECTING";
AdapterFactory.NOT_CONNECTED = "NOT_CONNECTED";

module.exports = AdapterFactory;
