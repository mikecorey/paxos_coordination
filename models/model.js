var Agent = function(locX, locY) {
    console.log('made an agent');
    this.locX = locX;
    this.locY = locY;
    this.mailbox = new Array();
}

var Message = function(timestamp, fromAgent, toAgent, message) {
    this.timestamp = timestamp;
    this.fromAgent = fromAgent;
    this.toAgent = toAgent;
    this.message = message;
}

var agents = new Array();