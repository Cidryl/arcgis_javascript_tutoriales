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
  'esri/Graphic',
  'esri/layers/GraphicsLayer'
], function(
  WebMap,
  MapView,
  Graphic,
  GraphicsLayer
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

    var graphicsLayer = new GraphicsLayer();
    app.map.add(graphicsLayer);

    /* PUNTO */
    var point = {
      type: 'point',
      longitude: -118.80657463861,
      latitude: 34.0005930608889
    };

    var simpleMarkerSymbol = {
      type: 'simple-marker',
      color: [226, 119, 40],  // orange
      outline: {
        color: [255, 255, 255], // white
        width: 1
      }
    };

    var pointGraphic = new Graphic({
      geometry: point,
      symbol: simpleMarkerSymbol
    });

    graphicsLayer.add(pointGraphic);

    /* LÍNEA */
    var simpleLineSymbol = {
      type: 'simple-line',
      color: [226, 119, 40], // orange
      width: 2
    };

    var polyline = {
      type: 'polyline',
      paths: [
        [-118.821527826096, 34.0139576938577],
        [-118.814893761649, 34.0080602407843],
        [-118.808878330345, 34.0016642996246]
      ]
    };

    var polylineGraphic = new Graphic({
      geometry: polyline,
      symbol: simpleLineSymbol
    });

    graphicsLayer.add(polylineGraphic);

    /* POLÍGONO */
    var polygon = {
      type: "polygon",
      rings: [
        [-118.818984489994, 34.0137559967283],
        [-118.806796597377, 34.0215816298725],
        [-118.791432890735, 34.0163883241613],
        [-118.79596686535, 34.008564864635],
        [-118.808558110679, 34.0035027131376]
      ]
    };

    var simpleFillSymbol = {
      type: 'simple-fill',
      color: [227, 139, 79, 0.8],  // orange, opacity 80%
      outline: {
        color: [255, 255, 255],
        width: 1
      }
    };

    var polygonGraphic = new Graphic({
      geometry: polygon,
      symbol: simpleFillSymbol
    });

    graphicsLayer.add(polygonGraphic);
  }

  init();
});