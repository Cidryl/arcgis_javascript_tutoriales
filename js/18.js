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
  'esri/Graphic',
  'esri/geometry/geometryEngine'
], function(
  WebMap,
  MapView,
  FeatureLayer,
  Graphic,
  geometryEngine
) {
  var activeGraphic;
  var bufferGraphic;
  var lineGraphic;
  var textGraphic;

  var featureLayer = new FeatureLayer({
    url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0'
  });

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

    app.view.on('pointer-move', function(event) {
      findNearestGraphic(event).then(function(graphic) {
        if (graphic) {
          activeGraphic = graphic;
          var buffer = geometryEngine.geodesicBuffer(activeGraphic.geometry, .25, 'miles');
          drawBuffer(buffer);
        }
      });

      // Insertar el punto en la ubicación
      if (bufferGraphic) {
        var cursorPoint = app.view.toMap(event);
        var intersects = geometryEngine.intersects(bufferGraphic.geometry, cursorPoint);
        var symbol = bufferGraphic.symbol.clone();

        if (intersects) {
          symbol.color = 'rgba(0,0,0,.15)'; // Highlight
        } else {
          symbol.color = 'rgba(0,0,0,0)'; // Transparent
        }
        bufferGraphic.symbol = symbol;

        var vertexResult = geometryEngine.nearestVertex(bufferGraphic.geometry, cursorPoint);
        var closestPoint = vertexResult.coordinate;
        drawLine(cursorPoint, closestPoint);

        var distance = geometryEngine.geodesicLength(lineGraphic.geometry, 'miles');
        drawText(cursorPoint, distance);
      }
    });

    app.map.add(featureLayer);


    /* DESAFIO */
    app.view.on('click', function(event){
      findNearestGraphic(event).then(function(graphic){
        if (graphic) {
          activeGraphic = graphic;
          var buffer = geometryEngine.geodesicBuffer(activeGraphic.geometry, .25, 'miles');
          //*** ADD ***//
          buffer = geometryEngine.densify(buffer, 250, 'meters');
          drawBuffer(buffer);
        }
      });
    });
  }

  /** Crear buffer */
  function findNearestGraphic(event) {
    return app.view.hitTest(event).then(function (response) {
      var graphic, filteredResult;

      // Get the Trail graphics only
      if (response.results.length) {
        filteredResult = response.results.filter(function (result) {
          return (result.graphic.layer === featureLayer);
        })[0];
      }

      // Only return new graphics are found
      if (filteredResult) {
        graphic = filteredResult.graphic;

        if (!activeGraphic || (activeGraphic.attributes.OBJECTID !== graphic.attributes.OBJECTID)) {
          return graphic;
        } else {
          return null;
        }
      } else {
        return null;
      }
    });
  }

  function drawBuffer(bufferGeometry) {
    app.view.graphics.remove(bufferGraphic);

    bufferGraphic = new Graphic({
      geometry: bufferGeometry,
      symbol: {
        type: 'simple-fill',
        color: 'rgba(0,0,0,0)',
        outline: {
          color: 'rgba(0,0,0,.5)',
          width: 1
        }
      }
    });

    app.view.graphics.add(bufferGraphic);
  }

  /** Encontrar el punto cercano */
  function drawLine(point, point2) {
    app.view.graphics.remove(lineGraphic);

    lineGraphic = new Graphic({
      geometry: {
        type: 'polyline',
        paths: [
          [point.longitude, point.latitude],
          [point2.longitude, point2.latitude]
        ]
      },
      symbol: {
        type: 'simple-line',
        color: '#333333',
        width: 1
      }
    });

    app.view.graphics.add(lineGraphic);
  }

  /** Calcular la distancia */
  function drawText(point, distance) {
    app.view.graphics.remove(textGraphic);

    textGraphic = new Graphic({
      geometry: point,
      symbol: {
        type: 'text',
        text: distance.toFixed(2) + ' miles',
        color: 'black',
        font: {
          size: 12
        },
        haloColor: 'white',
        haloSize: 1
      }
    })

    app.view.graphics.add(textGraphic)
  }

  init();
});