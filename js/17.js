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
    center: [-40, 28], /* longitud, latitud / x, y */
    zoom: 2,
    z: 25000, /* altitud en metros - para sceneView (3D) */
    tilt: 65 /* perspectiva en grados */
  }
};

require([
  'esri/WebMap',
  'esri/views/MapView',
  'esri/widgets/Locate',
  'esri/widgets/Track',
  'esri/Graphic',
  'esri/widgets/Compass'
], function(
  WebMap,
  MapView,
  Locate,
  Track,
  Graphic,
  Compass
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

    /** Se usa para localizar el dispositvo con que te conectas y hace zoom al mapa */
    var locate = new Locate({
      view: app.view,
      useHeadingEnabled: false,
      goToOverride: function(view, options) {
        options.target.scale = 1500;  // Override the default map scale

        return view.goTo(options.target);
      }
    });

    // app.view.ui.add(locate, 'top-left');

    /** Automáticamente rota la vista acorde la dirección en la que se viaja */
    var track = new Track({
      view: app.view,
      graphic: new Graphic({
        symbol: {
          type: 'simple-marker',
          size: '12px',
          color: 'green',
          outline: {
            color: '#efefef',
            width: '1.5px'
          }
        }
      }),
      useHeadingEnabled: false  // Don't change orientation of the map
    });

    app.view.ui.add(track, 'top-left');

    var compass = new Compass({
      view: app.view
    });

    app.view.ui.add(compass, 'top-left');
  }

  init();
});