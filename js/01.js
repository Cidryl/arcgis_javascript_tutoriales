var app = {
  map: null,
  view: null,
  scene: null
};

require([
  'esri/Map',
  'esri/views/MapView',
  'esri/views/SceneView'
], function(
  Map, 
  MapView,
  SceneView
) {
  function init() {
    app.map = new Map({
      basemap: 'topo-vector',
      ground: 'world-elevation' 
      // necesario para el mapa 3D, si se quita se verá plano aun en vista 3D
    });
    
    app.view = new MapView({
      container: 'mapView',
      map: app.map,
      center: [-118.80500, 34.02700], // longitud, latitud
      zoom: 13
    });

    app.scene = new SceneView({
      container: 'sceneView',
      map: app.map,
      camera: { //punto de observación o la cámara
        position: {
          x: -118.80500,
          y: 34.02700,
          z: 25000 // altitud en metros
        },
        tilt: 65 // perspectiva en grados
      }
    });
  }
  
  init();
});