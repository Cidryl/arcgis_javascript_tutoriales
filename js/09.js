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
  'esri/Basemap',
  'esri/layers/VectorTileLayer'
], function(
  Map,
  MapView,
  Basemap,
  VectorTileLayer
) {
  /* Inicializar los elementos */
  function init() {
    var basemap = new Basemap({
      baseLayers: [
        new VectorTileLayer({
          portalItem: {
            id: 'd2ff12395aeb45998c1b154e25d680e5' // Forest and Parks Canvas
          },
          opacity: 0.5
        })
      ]
    });
    
    app.map = new Map({
      basemap: basemap
    });
    
    app.view = new MapView({
      container: app.content.view,
      map: app.map,
      center: app.info.center,
      zoom: app.info.zoom
    });
  }

  init();
});