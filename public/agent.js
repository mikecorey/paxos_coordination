//How often should we run a tick...  This is stored outside the Agent constructor for speed adjustment
var internalUpdateFreq = 50;

function Agent(id, color, flightplan, speed, enabled) {
	//A unique identifier for an agent
	this.id = id;
	//A string representing the color of the agent on the map
	this.color = color;
	//An array of {lat: x, lng: y} objects
	this.flightplan = flightplan;
	//The speed of an agent in Meters / Second
	this.speed = speed;
	//Is the Agent enabled
	this.enabled = enabled;
	//Initializing the current position and next waypoint to visit
	this.currentPos = flightplan[0];
	this.nextWaypoint = flightplan[1];

	//An annoying javascript nuance i don't totally get involving the fact that we need to pass a function instead of a returned value of a function
	var me = this;

  function isAtWaypoint(lastGoogleMapsLatLng, nextGoogleMapsLatLng) {
    return google.maps.geometry.spherical.computeDistanceBetween(lastGoogleMapsLatLng, nextGoogleMapsLatLng) < (me.speed + 1);
  }

	//run() executes every tick of the setInterval for agent.
	function run() {
		var lastGoogleMapsLatLng = new google.maps.LatLng(me.currentPos);
		var nextGoogleMapsLatLng = new google.maps.LatLng(me.nextWaypoint);
    if (isAtWaypoint(lastGoogleMapsLatLng, nextGoogleMapsLatLng)) {
      var requestRemove = me.flightplan.shift();
			collectedWaypoint(requestRemove);
      updateWaypoints();
      if (me.flightplan.length > 1) {
        me.nextWaypoint = me.flightplan[1];
			  nextGoogleMapsLatLng = new google.maps.LatLng(me.nextWaypoint);
      } else {
        nextGoogleMapsLatLng = new google.maps.LatLng(me.currentPos);
      }          
    }
		me.heading = google.maps.geometry.spherical.computeHeading(lastGoogleMapsLatLng, nextGoogleMapsLatLng);		
		var posAfterTimestep = google.maps.geometry.spherical.computeOffset(lastGoogleMapsLatLng, (internalUpdateFreq / 1000) * speed, me.heading);
		me.currentPos = {lat: posAfterTimestep.lat(), lng: posAfterTimestep.lng()};
    updateAgentLocation();
	}
    
    this.interval = setInterval(function () {
        if (me.enabled) {
            run();
        }
    }, internalUpdateFreq);
}