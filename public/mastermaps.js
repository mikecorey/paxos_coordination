var collectMarkers = [];
var agentMarkers = [];

var map = null;

var agents = [];
var collects = [];
var mapLines = [];
var colors = ['#4286f4','#f4425f','#f4f442','#5ff442','#d942f4','#f3b2ff','#ffb2b2','#b2d7ff','#b2ffb6','#f9ffb2'];

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
    strokeColor: colors[agentID],
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

function updateFlightplan(agentID, flightplan) {
  var tmpLoc = [{lat: agentMarkers[agentID].getPosition().lat(),
                lng: agentMarkers[agentID].getPosition().lng()}];
  mapLines[agentID].setPath(tmpLoc.concat(flightplan));
}