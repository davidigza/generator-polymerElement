var PolymerApp = PolymerApp || {};
PolymerApp.config = {
  ELEMENTS_PATHS: {
    'helpers':  'components/core/helpers/',
    'components': 'components/',
    'dataManagers': 'components/',
    'dataProviders': 'components/'
  },
  INJECTIONS_CONTAINERS: {
    'staticContainer': 'injectionStatic',
    'dynamicContainer': 'injectionsDynamic'
  },
  LOGIN: {
    logged: false,
    urlPath: 'base_login_url',//varible entornos
    autologin: 'autologin_value', //varible entornos
    user: 'user_value',//varible entornos
    pass: 'pass_value' //varible entornos
  }
};
