var app = {
  map: null,
  view: null,
  scene: null,
  content: { /* Los Id de los elementos */
    view: 'mapView',
    scene: 'sceneView'
  },
  info: { /* Información para construir el mapa y las vistas mapview y sceneview */
    basemap: 'streets-navigation-vector',
    center: [-118.24532, 34.05398], /* longitud, latitud / x, y */
    zoom: 12,
    z: 25000, /* altitud en metros - para sceneView (3D) */
    tilt: 65 /* perspectiva en grados */
  }
};

require([
  'esri/WebMap',
  'esri/views/MapView',
  'esri/tasks/RouteTask',
  'esri/tasks/support/RouteParameters',
  'esri/tasks/support/FeatureSet',
  'esri/Graphic'
], function(
  WebMap,
  MapView,
  RouteTask,
  RouteParameters,
  FeatureSet,
  Graphic
) {
  var routeTask = new RouteTask({
    url: 'https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World'
    // url: 'https://utility.arcgis.com/usrsvcs/appservices/<your-id>/rest/services/World/Route/NAServer/Route_World'
    // proxy
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
      zoom: app.info.zoom,
      padding: {
        right: 320
      }
    });

    app.view.on('click', function(event){
      if (app.view.graphics.length === 0) {
        addGraphic('start', event.mapPoint);
      } else if (app.view.graphics.length === 1) {
        addGraphic('finish', event.mapPoint);
        getRoute();
      } else {
        app.view.graphics.removeAll();
        addGraphic('start', event.mapPoint);
      }
    });
  }

  function addGraphic(type, point) {
    var graphic = new Graphic({
      symbol: {
        type: 'simple-marker',
        color: (type === 'start') ? 'white' : 'black',
        size: '8px'
      },
      geometry: point
    });

    app.view.graphics.add(graphic);
  }

  function getRoute() {
    // Setup the route parameters
    var routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: app.view.graphics.toArray() // Pass the array of graphics
      }),
      returnDirections: true
    });

    // Get the route
    routeTask.solve(routeParams).then(function(data) {
      // Display the route
      data.routeResults.forEach(function(result) {
        result.route.symbol = {
          type: 'simple-line',
          color: [5, 150, 255],
          width: 3
        };

        app.view.graphics.add(result.route);
      });

      // Display the directions
      var directions = document.createElement('ol');
      directions.classList = 'esri-widget esri-widget--panel esri-directions__scroller';
      directions.style.marginTop = 0;
      directions.style.paddingTop = '15px';

      // Show the directions
      var features = data.routeResults[0].directions.features;
      features.forEach(function(result,i){
        var direction = document.createElement('li');
        direction.innerHTML = result.attributes.text + ' (' + result.attributes.length.toFixed(2) + ' miles)';
        directions.appendChild(direction);
      });

      // Add directions to the view
      app.view.ui.empty('top-right');
      app.view.ui.add(directions, 'top-right');
    });
  }

  init();
});