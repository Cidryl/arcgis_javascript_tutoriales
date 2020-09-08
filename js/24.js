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
    center: [-118.24532, 34.05398], /* longitud, latitud / x, y */
    zoom: 14,
    z: 25000, /* altitud en metros - para sceneView (3D) */
    tilt: 65 /* perspectiva en grados */
  }
};

require([
  'esri/Map',
  'esri/views/MapView',

  'esri/portal/Portal',
  'esri/identity/OAuthInfo',
  'esri/identity/IdentityManager',

  'esri/layers/MapImageLayer',

  'dojo/dom-style',
  'dojo/dom-attr',
  'dojo/on',
  'dojo/dom'
], function(
  Map,
  MapView,
  Portal,
  OAuthInfo,
  identityManager,

  MapImageLayer,

  domStyle,
  domAttr,
  on,
  dom
) {
  var portalUrl = 'https://www.arcgis.com/sharing';

  var info = new OAuthInfo({
    appId: 'JTpyML5GgvA1jEoo', //*** El valor de su ID de cliente va aquí ***//
    popup: false // Los redireccionamientos en línea no requieren ninguna configuración de aplicación adicional
  });

  identityManager.registerOAuthInfos([info]);

  on(dom.byId('sign-in'), 'click', function() {
    identityManager.getCredential(portalUrl);
  });

  on(dom.byId('sign-out'), 'click', function() {
    identityManager.destroyCredentials();
    window.location.reload();
    displayMap();
  });

  identityManager.checkSignInStatus(portalUrl).then(function() {
    dom.byId('anonymousPanel').style.display = 'none';
    dom.byId('personalizedPanel').style.display = 'block';
  });

  /* Inicializar los elementos */
  function displayMap() { // init() que se viene trabajando en los ejercicios anteriores
    var portal = new Portal();

    portal.load().then(function() {
      dom.byId(app.content.view).style.display = 'flex';

      app.map = new Map({
        basemap: app.info.basemap
      });

      app.view = new MapView({
        container: app.content.view,
        map: app.map,
        center: app.info.center,
        zoom: app.info.zoom
      });

      var traffic = new MapImageLayer({
        url: 'https://traffic.arcgis.com/arcgis/rest/services/World/Traffic/MapServer'
        // url: ¿https://utility.arcgis.com/usrsvcs/appservices/<your-id>/rest/services/World/Traffic/MapServer¿
      })

      app.map.add(traffic);
    });
  }
});