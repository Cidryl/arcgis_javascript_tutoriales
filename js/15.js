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
  'esri/layers/FeatureLayer',
  'esri/widgets/Editor'
], function(
  WebMap,
  MapView,
  FeatureLayer,
  Editor
) {
  var graphicsLayer = new GraphicsLayer();

  /* Inicializar los elementos */
  function init() {
    var myPointsFeatureLayer = new FeatureLayer({
      //*** Replace with your URL ***//
      url: 'https://services.arcgis.com/<your_ID>/arcgis/rest/services/my_points/FeatureServer/0'
    });

    app.map = new WebMap({
      basemap: app.info.basemap,
      layers: [myPointsFeatureLayer]
    });
    
    app.view = new MapView({
      container: app.content.view,
      map: app.map,
      center: app.info.center,
      zoom: app.info.zoom
    });

    var editorWidget = new Editor({
      view: app.view
    });

    app.view.ui.add(editorWidget, 'top-right');

    /**
     * Acciones por hacer:
     * Agregar:
     *  ID: 100
     *  Nombre: My Point
     *  Calificacion: Good
     * 
     * Editar:
     *  Id: 101
     *  Nombre: Awesome Beach
     *  Calificación: Excellent
     * 
     * Eliminar:
     *  Abrir el punto que editó, luego hacer clic en Eliminar
     */
  }

  init();
});