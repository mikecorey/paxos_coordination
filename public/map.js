var agentMarker = null;

var mapLine = null;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: centerLatLong,
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  map.addListener('click', function (event) {
      console.log('clicked: ' + event.latLng);
      agent.flightplan.push({lat : event.latLng.lat(), lng : event.latLng.lng()});
      updateWaypoints();
  });

  agentMarker = new google.maps.Marker({
    position: null,
    label: '' + agent.id,
    icon: {path: google.maps.SymbolPath.CIRCLE,
           scale: 10
         }, 
    map: map
  });

  mapLine = new google.maps.Polyline({
    strokeColor: agent.color,
    path: agent.flightplan,
    //icons: tmpicons,
    map: map 
  });
}

function updateAgentLocation() {
  agentMarker.setPosition(agent.currentPos);
}

function updateWaypoints() {
  mapLine.setPath(agent.flightplan);
}