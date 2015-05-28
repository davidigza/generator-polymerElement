var <%= elementName %> = <%= elementName %> || {};

<%= elementName %>.LoginLib = (function() {
  var password = '',
    username = '',
    cookieUrl =  <%= elementName %>.config.LOGIN.urlPath + '/DFAUTH/slod/DFServletXML',
    tsecUrl =  <%= elementName %>.config.LOGIN.urlPath + '/ASO/TechArchitecture/grantingTickets/V02',
    sessionUrl =  <%= elementName %>.config.LOGIN.urlPath + '/ENPP/enpp_mult_web_mobility_02/sessions/v1';


  function _setUserName(user) {
    username = user || username;
  }

  function _setPassword(pass) {
    password = pass || password;
  }

  function _getCookieParams() {
    return 'origen=enpp&eai_tipoCP=up&eai_user=0019-0'+username+'&eai_password='+password;
  }

  function _getTsecParams() {
    return {
      'authentication': {
        'authenticationData': [
          {
            'authenticationData': [password],
            'idAuthenticationData': 'password'
          }
        ] ,
        'authenticationType': '02',
        'consumerID': '00000013',
        'userID': '0019-0' + username
      }
    };
  }

  function _getSessionParams() {
    return JSON.stringify({'consumerID': '00000013'});
  }

  /**
   * [doCall description]
   * @param  {[type]} config    [ {
            method: '',
            url: '',
            headers: {},
            withCredentials: true|false,
            data: {}
          }]
   * @param  {[type]} cbSuccess [description]
   * @param  {[type]} cbError   [description]
   * @return {[type]}           [description]
   */
  function _doCall(attrs, cbSuccess, cbError) {
    var req;

    function _createHttpObject() {
      var req;
      if(window.XMLHttpRequest) {
        req = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        try {
          req = new ActiveXObject('Msxml2.XMLHTTP');
        } catch(failOne) {
          try {
            req = new ActiveXObject('Microsoft.XMLHTTP');
          } catch(failTwo) {
            throw new Error('Could not create HTTP request object.');
          }
        }
      }
      return req;
    }

    function _setHeaders(req, headers) {
      for(var key in headers) {
        req.setRequestHeader(key, attrs.headers[key]);
      }
    }

    req = _createHttpObject();
    req.open(attrs.method || 'GET', attrs.url);
    _setHeaders(req, attrs.headers);
    req.withCredentials = attrs.withCredentials || false;
    req.send(attrs.data);
    req.onreadystatechange = function() {
      if (req.readyState === 4) {
        if (req.status === 200) {
          cbSuccess(req.response, req);
        } else {
          cbError(req.response, req);
        }
      }
    };
  }

  /**
   * [doLogin make login in bbva system. Save tsec and user data in session storage]
   * @param  {[type]} username []
   * @param  {[type]} pass     []
   * @return {[Promise]}          []
   */
  function doLogin(username, pass) {
    return new Promise(function(resolve, reject) {

      function _getCookie() {
        var attrs = {
          method: 'POST',
          url: cookieUrl,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/json, text/javascript, */*;q=0.01',
            'Accept-Language': 'es-ES,es;q=0.8'
          },
          withCredentials: true,
          data: _getCookieParams()
        };
        _doCall(attrs,
          function() {
            _getTsec();
          },
          function(responseData) {
            reject(Error(responseData));
          }
        );
      }

      function _getTsec() {
        var attrs = {
          method: 'POST',
          url: tsecUrl,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/javascript, */*;q=0.01',
            'Accept-Language': 'es-ES,es;q=0.8'
          },
          withCredentials: true,
          data: JSON.stringify(_getTsecParams())
        };
        _doCall(attrs,
          function(responseData, req){
            var tsec = req.getResponseHeader('tsec'),
              data = JSON.parse(responseData);
            _saveLoginData({tsec: tsec, userdata: data.user});
            _getSession();
            <%= elementName %>.config.LOGIN.logged = true;
          },
          function(responseData) {
            reject(Error(responseData));
            _getSession();
          }
        );
      }


      function _getSession() {
        var attrs = {
          method: 'POST',
          url: sessionUrl,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'es-ES,es;q=0.8'
          },
          withCredentials: true,
          data: _getSessionParams()
        };
        _doCall(attrs,
          function(responseData, req) {
            var tsec = req.getResponseHeader('tsec'),
              data = JSON.parse(responseData);
            //_saveLoginData({tsec: tsec, userdata: data.user});
          },
          function(responseData) {
            //reject(Error(responseData));
          }
        );

      }


      /**
       * [_saveLoginData description]
       * @param  {[type]} data [description] {tesc:'x', userdata: {}}
       * @return {[type]}      [description]
       */
      function _saveLoginData(data) {
        var userData;
        if(data.userdata) {
          userData = {
            docid: data.userdata.id,
            name: data.userdata.name,
            surname: data.userdata.surname,
            surname2: data.userdata.surname2,
            lastConnection: data.userdata.lastAccessDate
          };
          sessionStorage.setItem('userData', JSON.stringify(userData));
        }
        sessionStorage.setItem('tsec', data.tsec);

        resolve('Logged');
      }

      function _cleanSessionStorage() {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('tsec');
      }


      if(!<%= elementName %>.config.LOGIN.logged) {
        _setUserName(username);
        _setPassword(pass);
        _cleanSessionStorage();
        _getCookie();
      } else {
        resolve('Logged');
      }

    });
  }

  return {
    doLogin: doLogin
  };

})();
