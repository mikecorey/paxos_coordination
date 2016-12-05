var agentMarker = null;
var collectMarkers = [];
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

function updateCollects() {
  for (var i = 0; i < collects.length; i++) {
    var doDraw = true;
    for (var j = 0; j < collectMarkers.length; j++) {
      if (collectMarkers[j].position.lat() == collects[i].lat &&
          collectMarkers[j].position.lng() == collects[i].lng) {
            //Already exists.  don't redraw.
            doDraw = false;
            console.log('doDraw hit this');
      }
    }
    if (doDraw) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng({lat: collects[i].lat, lng: collects[i].lng}),
        label: "C",
        map: map
      });
      collectMarkers.push(marker);
    }
  }
}


function updateWaypoints() {
  mapLine.setPath(agent.flightplan);
  pushFlightplan();
}