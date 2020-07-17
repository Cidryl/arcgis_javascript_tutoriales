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
  
  function TercerEjemplo() {
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
  }
  
  function createFillSymbol(value, color) {
    return {
      value: value,
      symbol: {
        color: color,
        type: 'simple-fill',
        style: 'solid',
        outline: {
          style: 'none'
        }
      },
      label: value
    };
  }
  
  function CuartoEjemplo() {
    var rendererJson = {
      type: 'simple',
      /* Los tipos de rendereización adminitos por arcgis son:
        'class-breaks'
        'dictionary'
        'dot-density'
        'heatmap'
        'simple'
        'unique-value'
      */
      symbol: {
        type: 'picture-marker',
        /* Los tipos de simbolo adminitos por arcgis son:
          'simple-marker'
          'picture-marker'
          'simple-line'
          'simple-fill'
          'picture-fill'
          'text'
          'shield-label-symbol'
          'point-3d'
          'line-3d'
          'polygon-3d'
          'mesh-3d'
          'label-3d'
          'cim'
        */
        url: 'http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0231b.png',
        width: '18px',
        height: '18px'
      }
    };
    
    var label = {
      symbol: {
        type: 'text',
        color: '#ffffff',
        haloColor: '#5e8d74',
        haloSize: '2px',
        font: {
          size: '12px',
          family: 'Noto Sans',
          style: 'italic',
          weight: 'normal'
        }
      },
      labelPlacement: 'above-center', //posición de la etiqueta sobre el FeatureLayer
      /* las posiciones adminitras por arcgis son:
        'above-center'
        'above-left'
        'above-right'
        'below-center'
        'below-left'
        'below-right'
        'center-center'
        'center-left'
        'above-after'
        'above-along'
        'above-before'
        'above-start'
        'above-end'
        'below-after'
        'below-along'
        'below-before'
        'below-start'
        'below-end'
        'center-after'
        'center-along'
        'center-before'
        'center-start'
        'center-end'
        'always-horizontal'
      */
      labelExpressionInfo: {
        expression: '$feature.TRL_NAME'
      }
    };
    
    var heads = new FeatureLayer({
      url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0',
      renderer: rendererJson,
      labelingInfo: [label]
    });
  
    app.map.add(heads);
    
    // ----------------------------------------------------------------------------------
    var trailRenderer = {
      type: 'simple',
      symbol: {
        color: '#ba55d3',
        type: 'simple-line',
        style: 'solid'
      },
      visualVariables: [{
        type: 'size',
        field: 'ELEV_GAIN',
        minDataValue: 0,
        maxDataValue: 2300,
        minSize: '3px',
        maxSize: '7px'
      }]
    };
    
    var trails = new FeatureLayer({
        url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0',
        renderer: trailRenderer,
        opacity: .75
    });
    
    app.map.add(trails, 0);
    
    // ----------------------------------------------------------------------------------
    var bikeTrailsRenderer = {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        style: 'short-dot',
        color: '#ff91ff',
        width: '1px'
      }
    };
    
    var bikeTrails = new FeatureLayer({
      url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0',
      renderer: bikeTrailsRenderer,
      definitionExpression: "USE_BIKE = 'YES'"
    });

    app.map.add(bikeTrails, 1);
    
    // ----------------------------------------------------------------------------------
    var openSpacesRenderer = {
      type: 'unique-value',
      field: 'TYPE',
      uniqueValueInfos: [
        createFillSymbol('Natural Areas', '#9E559C'),
        createFillSymbol('Regional Open Space', '#A7C636'),
        createFillSymbol('Local Park', '#149ECE'),
        createFillSymbol('Regional Recreation Park', '#ED5151'),
      ]
    };
    
    var openspaces = new FeatureLayer({
      url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0',
      renderer: openSpacesRenderer,
      opacity: 0.20
    });
    
    app.map.add(openspaces, 0);
  }
    
  init();
  CuartoEjemplo();
});