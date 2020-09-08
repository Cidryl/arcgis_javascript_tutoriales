var app = {
  map: null,
  view: null,
  scene: null,
  content: { /* Los Id de los elementos */
    view: 'mapView',
    scene: 'sceneView'
  },
  info: { /* Información para construir el mapa y las vistas mapview y sceneview */
    basemap: 'topo-vector',
    center: [-118.80500, 34.02700], /* longitud, latitud / x, y */
    zoom: 13,
    z: 25000, /* altitud en metros - para sceneView (3D) */
    tilt: 65 /* perspectiva en grados */
  }
};

require([
  'esri/WebMap',
  'esri/views/MapView',
  'esri/widgets/Search',
  'esri/layers/FeatureLayer'
], function(
  WebMap,
  MapView,
  Search,
  FeatureLayer
) {
  /* Inicializar los elementos */
  function init() {
    app.map = new WebMap({
      basemap: app.info.basemap
    });
    
    app.view = new MapView({
      container: app.content.view,
      map: app.map,
      center: app.info.center,
      zoom: app.info.zoom
    });

    var search = new Search({
      view: app.view
    });

    app.view.ui.add(search, 'top-right');

    var trailsLayer = new FeatureLayer({
      url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0',
    });

    app.map.add(trailsLayer); // Optionally add layer to map

    search.sources.push({
      layer: trailsLayer,
      searchFields: ['TRL_NAME'],
      displayField: 'TRL_NAME',
      exactMatch: false,
      outFields: ['TRL_NAME', 'PARK_NAME'],
      resultGraphicEnabled: true,
      name: 'Trailheads',
      placeholder: 'Example: Medea Creek Trail',
    });

    app.view.on('click', function(evt) {
      search.clear();
      view.popup.clear();

      if (search.activeSource) {
        var geocoder = search.activeSource.locator; // World geocode service
        var params = {
          location: evt.mapPoint
        };

        geocoder.locationToAddress(params)
          .then(function(response) { // Show the address found
            var address = response.address;
            showPopup(address, evt.mapPoint);
          }, function(err) { // Show no address found
            showPopup('No address found.', evt.mapPoint);
          });
      }
    });
  }

  function showPopup(address, pt) {
    view.popup.open({
      title:  + Math.round(pt.longitude * 100000)/100000 + ',' + Math.round(pt.latitude * 100000)/100000,
      content: address,
      location: pt
    });
  }

  init();
});