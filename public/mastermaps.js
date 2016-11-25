var collectMarkers = [];
var agentMarkers = [];

var map = null;

var agents = [];
var collects = [];

var siteNo = 0;

function addCollectMarker (pos) {
  var marker = new google.maps.Marker({
    position: pos,
    label: "" + siteNo++,
    map: map
  });
  marker.addListener('click', function (event) {
    marker.setMap(null);
    removeCollect({lat:pos.lat(), lng: pos.lng()});
  });
  collectMarkers.push(marker);
  addCollect({lat:pos.lat(), lng:pos.lng()});
}

function addAgentMarker (pos) {
  var marker = new google.maps.Marker({
    position: pos,
    label: "A",
    icon: {path: google.maps.SymbolPath.CIRCLE,
           scale: 10
         }, 
    map: map
  });
  agentMarkers.push(marker);
}

function addFlightplan(agentID) {
  mapLines[agentID] = new google.maps.Polyline({
    strokeColor: agents[agentID].color,
    path: agents[agentID].flightplan,
    //icons: tmpicons,
    map: map 
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  map.addListener('click', function (event) {
    addCollectMarker(event.latLng);
  });  

}



//FUNCTIONS THAT AN AGENT EXECUTES ON THE MAP
function updateAgentLocation(agentID, loc) {
  agentMarkers[agentID].setPosition(loc);
}

function updateWaypoints(agentID) {
  console.log('updateWaypointsNotImplemented');
  mapLines[agentID].setPath(agents[agentID].flightplan);
}