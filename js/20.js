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
  'esri/tasks/Locator',
  'esri/Graphic'
], function(
  WebMap,
  MapView,
  Locator,
  Graphic
) {
  var places = ['Coffee shop', 'Gas station', 'Food', 'Hotel', 'Parks and Outdoors'];

  var locator = new Locator({
    url: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
  });

  var select = document.createElement('select','');
  select.setAttribute('class', 'esri-widget esri-select');
  select.setAttribute('style', 'width: 175px; font-family: Avenir Next W00; font-size: 1em');
  
  places.forEach(function(p) {
    var option = document.createElement('option');
    option.value = p;
    option.innerHTML = p;
    select.appendChild(option);
  });

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

    app.view.ui.add(select, 'top-right');
  }

  function findPlaces(category, pt) {
    locator.addressToLocations({
      location: pt,
      categories: [category],
      maxLocations: 25,
      outFields: ['Place_addr','PlaceName']
    })
    .then(function(results) {
      // Clear the map
      app.view.popup.close();
      app.view.graphics.removeAll();
      // Add graphics
      results.forEach(function(result){
        app.view.graphics.add(
          new Graphic({
            attributes: result.attributes,
            geometry: result.location,
            symbol: {
             type: 'simple-marker',
             color: '#000000',
             size: '12px',
             outline: {
               color: '#ffffff',
               width: '2px'
             }

            },
            popupTemplate: {
              title: '{PlaceName}',
              content: '{Place_addr}'
            }
         }));
      });
    });
  }

  init();

  // Search for places in center of map when the app loads
  findPlaces(select.value, app.view.center);

  // Listen for category changes and find places
  select.addEventListener('change', function (event) {
    findPlaces(event.target.value, app.view.center);
  });

  // Listen for mouse clicks and find places
  app.view.on('click', function(event){
    view.hitTest(event.screenPoint)
      .then(function(response){
        if (response.results.length < 2) { // If graphic is not clicked, find places
          findPlaces(select.options[select.selectedIndex].text, event.mapPoint);
        }
    })
  });
});