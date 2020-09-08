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
  'esri/widgets/CoordinateConversion'
], function(
  WebMap,
  MapView,
  CoordinateConversion
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

    var coordsWidget = document.createElement('div');
    coordsWidget.id = 'coordsWidget';
    coordsWidget.className = 'esri-widget esri-component';
    coordsWidget.style.padding = '7px 15px 5px';

    app.view.ui.add(coordsWidget, 'bottom-right');

    app.view.watch('stationary', function(isStationary) {
      showCoordinates(app.view.center);
    });

    app.view.on('pointer-move', function(evt) {
      showCoordinates(app.view.toMap({ x: evt.x, y: evt.y }));
    });

    var coordinateConversionWidget = new CoordinateConversion({
      view: app.view
    });

    app.view.ui.add(coordinateConversionWidget, 'top-right');
  }

  function showCoordinates(pt) {
    var coords = 'Lat/Lon ' + pt.x.toFixed(3) + ' ' + pt.y.toFixed(3) +
        ' | Scale 1:' + Math.round(app.view.scale * 1) / 1 +
        ' | Zoom ' + app.view.zoom;

    coordsWidget.innerHTML = coords;
  }

  init();
});