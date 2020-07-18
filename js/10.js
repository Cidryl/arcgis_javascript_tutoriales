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
  'esri/widgets/Legend',
  'esri/widgets/ScaleBar'
], function(
  WebMap,
  MapView,
  Legend,
  ScaleBar
) {
  /* Inicializar los elementos */
  function init() {
    app.map = new WebMap({
      portalItem: {
        id: '41281c51f9de45edaf1c8ed44bb10e30'
      }
    });
    
    app.view = new MapView({
      container: app.content.view,
      map: app.map
    });
    
    var legend = new Legend({
      view: app.view
    });
    app.view.ui.add(legend, 'top-right');

    var scalebar = new ScaleBar({
      view: app.view
    });
    app.view.ui.add(scalebar, 'bottom-left');
  }

  init();
});