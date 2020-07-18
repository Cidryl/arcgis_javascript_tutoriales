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
  'esri/Map',
  'esri/views/MapView',
  'esri/layers/Layer'
], function(
  Map,
  MapView,
  Layer
) {
  /* Inicializar los elementos */
  function init() {
    app.map = new Map({
      basemap: app.info.basemap
    });
    
    app.view = new MapView({
      container: app.content.view,
      map: app.map,
      center: app.info.center,
      zoom: app.info.zoom
    });
  }
  
  /* Agregar una capa con promesa */
  function addLayer(itemPromise, index) {
    /*return itemPromise.then(function(layer) {
      app.map.add(layer, index);
    });*/
    
    /* Limite las funciones de capa con una expresión de definición SQL */
    return itemPromise.then(function(layer) {
      layer.when(function() {
        if (layer.title === 'Trails_Styled_Popups') {
          layer.definitionExpression = 'ELEV_GAIN < 250';
        }
      });
      
      app.map.add(layer, index);
    });
  }
  
  init();
  
  var trailheadsPortalItem = Layer.fromPortalItem({
    portalItem: {
      id: '33fc2fa407ab40f9add12fe38d5801f5'
    }
  });
  
  var trailsPortalItem = Layer.fromPortalItem({
    portalItem: {
      id: '52a162056a2d48409fc3b3cbb672e7da'
    }
  });
  
  var parksPortalIdem = Layer.fromPortalItem({
    portalItem: {
      id: '83cf97eea04e4a699689c250dd07b975'
    }
  });
  
  addLayer(trailheadsPortalItem, 2)
    .then(addLayer(trailsPortalItem, 1))
    .then(addLayer(parksPortalIdem, 0));
  
});