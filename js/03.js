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
  'esri/widgets/Expand', //Nuevo, es para ocultar o expandir un widgets
  'esri/layers/FeatureLayer'
], function(
  Map, 
  MapView,
  SceneView,
  BasemapToggle,
  BasemapGallery,
  Expand,
  FeatureLayer
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
    
    // agregar popup por defecto con todos los atributos, el comodin de '*' deja de ser funcional hasta el 4.11
    app.view.popup.defaultPopupTemplateEnabled = true;
    app.scene.popup.defaultPopupTemplateEnabled = true;
  }
  
  function addBasemaps(contentMap) {
    var toggle = new BasemapToggle({
      view: contentMap,
      nextBasemap: 'osm'
    });
    
    contentMap.ui.add(toggle, 'bottom-right');
    
    var gallery = new BasemapGallery({
      view: contentMap,
      source: {
        portal: {
          url: 'https://www.arcgis.com',
          useVectorBasemaps: true // Cargar mapas base de mosaico ráster
        }
      }
    });
    
    // contentMap.ui.add(app.widgets.gallery, 'top-right');
    
    var bgExpand = new Expand({
      view: contentMap,
      content: gallery
    });
        
    contentMap.ui.add(bgExpand, 'top-right');
  }
  
  function loadFeatureLayer(url, options = [], pos = 0) {
    // si no se agrega una posición, siempre agregará la nueva capa al inicio (de primero)
    var layer = new FeatureLayer({
      url: url,
      definitionExpression: options.where || null, // filtros sobre los valores (atributos) de la capa
      outFields: options.outFields || ['*'],
      popupTemplate: options.popUp || this.popupTemplate
    });
    
    if (options.renderer) { // personalizar el renderizado o dejar por defecto
      layer.setRenderer(options.renderer);
    }

    app.map.add(layer, pos);
  }
  
  init();
  
  // Puntos
  loadFeatureLayer('https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0');
  // Caminos
  loadFeatureLayer('https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0', {
    where: 'ELEV_GAIN < 250',
    outFields: ['TRL_NAME', 'ELEV_GAIN'],
    popUp: {
      title: '{TRL_NAME}', // Valor del atributo
      content: 'The trail elevation gain is {ELEV_GAIN} ft.'  // mostrar contenido
    }
  });
  // Parques
  loadFeatureLayer('https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0');
});