(function (document) {
  'use strict';

  window.addEventListener('WebComponentsReady', function() {
    document.querySelector('body').removeAttribute('unresolved');
  });

})(document);
