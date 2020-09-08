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
  'esri/layers/GraphicsLayer',
  'esri/widgets/Sketch'
], function(
  WebMap,
  MapView,
  GraphicsLayer,
  Sketch
) {
  var graphicsLayer = new GraphicsLayer();

  /* Inicializar los elementos */
  function init() {
    app.map = new WebMap({
      basemap: app.info.basemap,
      layers: [graphicsLayer]
    });
    
    app.view = new MapView({
      container: app.content.view,
      map: app.map,
      center: app.info.center,
      zoom: app.info.zoom
    });

    var sketch = new Sketch({
      view: app.view,
      layer: graphicsLayer
    });

    app.view.ui.add(sketch, 'top-right');

    /* Desafío */
    //*** Red stroke, 1px wide ***//
    var stroke = {
      color: [255,0,0],
      width: 1
    }

    //*** White fill color with 50% transparency ***//
    var fillColor = [255,255,255,.5];

    //*** Override all of the default symbol colors and sizes ***//
    var pointSymbol = sketch.viewModel.pointSymbol;
    pointSymbol.color = fillColor;
    pointSymbol.outline = stroke;
    pointSymbol.size = 8;

    var polylineSymbol = sketch.viewModel.polylineSymbol;
    polylineSymbol.color = stroke.color;
    polylineSymbol.width = stroke.width;

    var polygonSymbol = sketch.viewModel.polygonSymbol;
    polygonSymbol.color = fillColor;
    polygonSymbol.outline = stroke;

    sketch.on('create', function(event) {
      if (event.state === 'complete') {
        var attributes = {
          name: 'My Graphic',
          type: event.graphic.geometry.type
        }
        event.graphic.attributes = attributes;

        var popupTemplate = {
          title: '{name}',
          content: 'I am a {type}.'
        }
        event.graphic.popupTemplate = popupTemplate;
      }
    });
  }

  init();
});