var app = {
  map: null,
  view: null,
  scene: null,
  widgets: {
    toggle: null,
    gallery: null
  }
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
    
    // contentMap.ui.add(gallery, 'top-right');
    
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
  
  function QuintoEjemplo() {
    loadFeatureLayer('https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0', {
      outFields: ['TRL_NAME', 'CITY_JUR', 'X_STREET', 'PARKING', 'ELEV_FT'],
      popUp: {
        title: '{TRL_NAME}', // Valor del atributo
        content: '<b>City:</b> {CITY_JUR}<br><b>Cross Street:</b> {X_STREET}<br><b>Parking:</b> {PARKING}<br><b>Elevation:</b> {ELEV_FT} ft'  // mostrar contenido
      }
    });

    // -------------------------------------------------------------------------------------
    var popupOpenspaces = {
      title: '{PARK_NAME}',
      content: [{
        type: 'fields',
        fieldInfos: [{
          fieldName: 'AGNCY_NAME',
          label: 'Agencia',
          isEditable: true,
          tooltip: '',
          visible: true,
          format: null,
          stringFieldOption: 'text-box'
        }, {
          fieldName: 'TYPE',
          label: 'Tipo',
          isEditable: true,
          tooltip: '',
          visible: true,
          format: null,
          stringFieldOption: 'text-box'
        }, {
          fieldName: 'ACCESS_TYP',
          label: 'Acceso',
          isEditable: true,
          tooltip: '',
          visible: true,
          format: null,
          stringFieldOption: 'text-box'
        }, {
          fieldName: 'GIS_ACRES',
          label: 'Acres',
          isEditable: true,
          tooltip: '',
          visible: true,
          format: {
            places: 2,
            digitSeparator: true
          },
          stringFieldOption: 'text-box'
        }]
      }]
    }; 
    
    loadFeatureLayer('https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space_Styled/FeatureServer/0', {
      outFields: ['TYPE', 'PARK_NAME', 'AGNCY_NAME', 'ACCESS_TYP', 'GIS_ACRES'],
      popUp: popupOpenspaces
    });
  }
  
  function ChallengeQuinto() {
    var popupTrails = {
      title: 'Trail Information',
      expressionInfos: [{
        name: 'elevation-ratio',
        title: 'Elevation change',
        expression: 'Round((($feature.ELEV_MAX - $feature.ELEV_MIN)/($feature.LENGTH_MI)/5280)*100,2)'
      }],
      /* Multiple contenidos */
      content: [{
        type: 'text',
        text: 'The {TRL_NAME} trail average slope per mile is: {expression/elevation-ratio}% over a total of {LENGTH_MI} miles.'
      },{
        type: 'media',
        mediaInfos: [{
          type: 'column-chart',
          caption: '',
          value: {
            fields: ['ELEV_MIN', 'ELEV_MAX'],
            normalizeField: null,
            tooltipField: 'Min and max elevation values'
          }
        }]
      }]
    };
    
    
    loadFeatureLayer('https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0', {
      popUp: popupTrails
    });
  }
  
  init();
  
  // QuintoEjemplo();
  ChallengeQuinto();
});