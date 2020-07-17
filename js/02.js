var app = {
  map: null,
  view: null,
  scene: null
};

require([
  'esri/Map',
  'esri/views/MapView',
  'esri/views/SceneView',
  'esri/widgets/BasemapToggle',
  'esri/widgets/BasemapGallery',
  'esri/widgets/Expand' //Nuevo, es para ocultar o expandir un widgets
], function(
  Map, 
  MapView,
  SceneView,
  BasemapToggle,
  BasemapGallery,
  Expand
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
    
    addBasemaps(app.view);
    addBasemaps(app.scene);
  }
  
  function addBasemaps(contentMap) {
    var toggle = new BasemapToggle({
      view: contentMap,
      nextBasemap: 'osm'
    });
    
    contentMap.ui.add(toggle, 'bottom-right');
    
    gallery = new BasemapGallery({
      view: contentMap,
      source: {
        portal: {
          url: 'https://www.arcgis.com',
          useVectorBasemaps: true // Cargar mapas base de mosaico ráster
        }
      }
    });
    
    // contentMap.ui.add(gallery, 'top-right');
    
    var bgExpand = new Expand({
      view: contentMap,
      content: gallery
    });
        
    contentMap.ui.add(bgExpand, 'top-right');
  }
  
  init();
});