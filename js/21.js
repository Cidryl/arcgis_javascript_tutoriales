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
  'esri/widgets/Directions',
  'esri/symbols/SimpleMarkerSymbol'
], function(
  WebMap,
  MapView,
  Directions,
  SimpleMarkerSymbol
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
      zoom: app.info.zoom,
      padding: {
        right: 320
      }
    });

    var directions = new Directions({
      view: app.view,
      // routeServiceUrl: 'https://utility.arcgis.com/usrsvcs/appservices/<your-id>/rest/services/World/Route/NAServer/Route_World'
    });

    /** la url es un servicvio proxy para evitar solicitar el logeo */

    app.view.ui.add(directions, 'top-right');

    // Stop symbols
    directions.stopSymbols.first = createStopSymbol('green', '14px');
    directions.stopSymbols.middle = createStopSymbol('black', '10px');
    directions.stopSymbols.last = createStopSymbol('red', '14px');

    // Route symbol
    directions.routeSymbol.width = '2';
    directions.routeSymbol.color = [0, 0, 0, 0.75];
    directions.routeSymbol.style = 'short-dot';
  }

  function createStopSymbol(color, size) {
    return new SimpleMarkerSymbol({
      style: 'simple-marker',
      size: size,
      outline: {
        width: '2px',
        color: 'white'
      },
      color: color
    });
  }

  init();
});