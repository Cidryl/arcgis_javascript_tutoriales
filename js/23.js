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
    zoom: 11,
    z: 25000, /* altitud en metros - para sceneView (3D) */
    tilt: 65 /* perspectiva en grados */
  }
};

require([
  'esri/WebMap',
  'esri/views/MapView',
  'esri/tasks/ServiceAreaTask',
  'esri/tasks/support/ServiceAreaParameters',
  'esri/tasks/support/FeatureSet',
  'esri/Graphic'
], function(
  WebMap,
  MapView,
  ServiceAreaTask,
  ServiceAreaParameters,
  FeatureSet,
  Graphic
) {
  var serviceAreaTask = new ServiceAreaTask({
    url: 'https://route.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea'
    // rl: 'https://utility.arcgis.com/usrsvcs/appservices/<your-id>/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea'
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
      zoom: app.info.zoom
    });

    app.view.on('click', function(event){
      var locationGraphic = createGraphic(event.mapPoint);
      // var driveTimeCutoffs = [10]; // Minutes (default)
      var driveTimeCutoffs = [5,10,15];
      var serviceAreaParams = createServiceAreaParams(locationGraphic, driveTimeCutoffs, app.view.spatialReference);
      executeServiceAreaTask(serviceAreaParams);
    });
  }

  function createGraphic(point) {
    // Remove any existing graphics
    app.view.graphics.removeAll();
    // Create a and add the point
    var graphic = new Graphic({
      geometry: point,
      symbol: {
        type: 'simple-marker',
        color: 'white',
        size: 8
      }
    });

    app.view.graphics.add(graphic);

    return graphic;
  }

  function createServiceAreaParams(locationGraphic, driveTimeCutoffs, outSpatialReference) {
    // Create one or more locations (facilities) to solve for
    var featureSet = new FeatureSet({
      features: [locationGraphic]
    });

    // Set all of the input parameters for the service
    var taskParameters = new ServiceAreaParameters({
      facilities: featureSet, // Location(s) to start from
      defaultBreaks: driveTimeCutoffs, // One or more drive time cutoff values
      outSpatialReference: outSpatialReference // Spatial reference to match the view
    });

    return taskParameters;
  }

  function executeServiceAreaTask(serviceAreaParams) {
    return serviceAreaTask.solve(serviceAreaParams)
      .then(function(result) {
        if (result.serviceAreaPolygons.length) {
          // Draw each service area polygon
          result.serviceAreaPolygons.forEach(function(graphic) {
            graphic.symbol = {
              type: 'simple-fill',
              color: 'rgba(255,50,50,.25)'
            }

            app.view.graphics.add(graphic,0);
          });
        }
      }, function(error){
        console.log(error);
      });
  }

  init();
});