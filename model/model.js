function Agent (id, lat, lng) {
    this.id = id;
    this.lat = lat;
    this.lng = lng;
    this.mailbox = new Array();
}

function Collect (lat, lng) {
    this.lat = lat;
    this.lng = lng;
}

function Message (timestamp, fromAgent, toAgent, message) {
    this.timestamp = timestamp;
    this.fromAgent = fromAgent;
    this.toAgent = toAgent;
    this.message = message;
}

module.exports.Agent = Agent;
module.exports.Collect = Collect;
module.exports.Message = Message;