var app = {
  map: null,
  view: null,
  scene: null,
  content: { /* Los Id de los elementos */
    view: 'mapView',
    scene: 'sceneView'
  },
  widgets: { /* Se iran agregando nuevos widgets conforme se avance en los tutorieales */
    toggle: false,
    gallery: true
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
  'esri/views/SceneView',
  'esri/widgets/BasemapToggle',
  'esri/widgets/BasemapGallery',
  'esri/widgets/Expand',
  'esri/layers/FeatureLayer',
  'esri/layers/GraphicsLayer',
  'esri/Graphic'
], function(
  Map, 
  MapView,
  SceneView,
  BasemapToggle,
  BasemapGallery,
  Expand,
  FeatureLayer,
  GraphicsLayer,
  Graphic
) {
  /* Inicializar los elementos */
  function init() {
    app.map = new Map({
      basemap: app.info.basemap,
      // ground: 'world-elevation'
    });
    
    app.view = new MapView({
      container: app.content.view,
      map: app.map,
      center: app.info.center,
      zoom: app.info.zoom
    });

    app.scene = new SceneView({
      container: app.content.scene,
      map: app.map,
      camera: { //punto de observación o la cámara
        position: {
          x: app.info.center[0],
          y: app.info.center[1],
          z: app.info.z 
        },
        tilt: app.info.tilt 
      }
    });
    
    // agregar popup por defecto con todos los atributos, el comodin de '*' deja de ser funcional hasta el 4.11
    // app.view.popup.defaultPopupTemplateEnabled = true;
    // app.scene.popup.defaultPopupTemplateEnabled = true;
    
    addWdigets(app.view);
    addWdigets(app.scene);
  }
  
  /* Inicializar los componentes */
  function addWdigets(contentMap) {
    /* BasemapToggle */
    if (app.widgets.toggle) {
      var toggle = new BasemapToggle({
        view: contentMap,
        nextBasemap: 'osm'
      });

      contentMap.ui.add(toggle, 'bottom-right');
    }
    
    /* BasemapGallery */
    if (app.widgets.gallery) {
      var gallery = new BasemapGallery({
        view: contentMap,
        source: {
          portal: {
            url: 'https://www.arcgis.com',
            useVectorBasemaps: true // Cargar mapas base de mosaico ráster
          }
        }
      });

      var bgExpand = new Expand({
        view: contentMap,
        content: gallery
      });

      contentMap.ui.add(bgExpand, 'top-right');
    }
  }
  
  /* Agregar FeatureLayer */
  function loadFeatureLayer(url, options = []) {
    // si no se agrega una posición, siempre agregará la nueva capa al inicio (de primero
    /* Datos para el options:
      layer:     boolean.      Si carga un FeatureLayer complejo o solo los datos para cargar gráficos
      where:     string.       filtros sobre los valores (atributos) de la capa
      outFields: array string. Salida del FeatureLayer (atributos visibles)
      popUp:     json.         ventana emergente al hacer clic
      renderer:  json.         Estilo por aplicar al FeatureLayer
    */
    var layer = null;
    
    if (options.layer) {
      layer = new FeatureLayer({
        url: url,
        definitionExpression: options.where || null,
        outFields: options.outFields || ['*'],
        popupTemplate: options.popUp || this.popupTemplate
      });

      if (options.renderer) {
        layer.setRenderer(options.renderer);
      }
    } else {
      layer = new FeatureLayer({
        url: url
      });
    }
    
    return layer;
  }
  
  /* Agregar un gráfico basado en un resultado de consulta */
  /* Convertir a genérico */
  function addGraphics(result) {
    graphicsLayer.removeAll();
    
    result.features.forEach(function(feature){
      var g = new Graphic({
        geometry: feature.geometry,
        attributes: feature.attributes,
        symbol: {
          type: 'simple-marker',
          color: [0, 0, 0],
          outline: {
            width: 2,
            color: [0, 255, 255],
          },
          size: '20px'
        },
        popupTemplate: {
          title: '{TRL_NAME}',
          content: 'This a {PARK_NAME} trail located in {CITY_JUR}.'
        }
      });
      
      graphicsLayer.add(g);
    });
  }
  
  /* Ejecute consultas del lado del servidor y agregue gráficos */
  /* Convertir a genérico */
  function queryFeatureLayer(point, distance, spatialRelationship, sqlExpression) {
    var query = {
      geometry: point,
      distance: distance,
      spatialRelationship: spatialRelationship,
      outFields: ['*'],
      returnGeometry: true,
      where: sqlExpression
    };
    
    featureLayer.queryFeatures(query).then(function(result) {
      addGraphics(result, true);
    });
  }
  
  /* Ejecute consultas del lado del cliente y agregue gráficos */
  /* Convertir a genérico */
  function queryFeatureLayerView(point, distance, spatialRelationship, sqlExpression) {
    if (!app.map.findLayerById(featureLayer.id)) {
      featureLayer.outFields = ['*'];
      app.map.add(featureLayer, 0);
    }
    
    var query = {
      geometry: point,
      distance: distance,
      spatialRelationship: spatialRelationship,
      outFields: ['*'],
      returnGeometry: true,
      where: sqlExpression
    };
    
    app.view.whenLayerView(featureLayer).then(function(featureLayerView) {
      if (featureLayerView.updating) {
        var handle = featureLayerView.watch('updating', function(isUpdating) {
          if (!isUpdating) {
            featureLayerView.queryFeatures(query).then(function(result) {
              addGraphics(result);
            });
            
            handle.remove();
          }
        });
      } else {
        featureLayerView.queryFeatures(query).then(function(result) {
          addGraphics(result);
        });
      }
    });
  }
  
  init();
  
  var featureLayer = loadFeatureLayer('https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0');
  var graphicsLayer = new GraphicsLayer();
  app.map.add(graphicsLayer);
  
  var sql = "TRL_NAME like '%Canyon%'";
  
  /* cuando la carga esté lista */
  app.view.when(function() {
    // queryFeatureLayer(app.view.center, 1500, 'intersects');
    queryFeatureLayerView(app.view.center, 1500, 'intersects'); // agregar el último parámetro 'sql'
  });
  
  /* agregar evento al hacer clic sobre el mapa */
  app.view.on('click', function(event) {
    // queryFeatureLayer(event.mapPoint, 1500, 'intersects');
    queryFeatureLayerView(event.mapPoint, 1500, 'intersects'); // agregar el último parámetro 'sql'
  });

  app.scene.on('click', function(event) {
    // queryFeatureLayer(event.mapPoint, 1500, 'intersects');
    queryFeatureLayerView(event.mapPoint, 1500, 'intersects'); // agregar el último parámetro 'sql'
  });
  
  
});