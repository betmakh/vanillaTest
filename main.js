(function() {
  'use strict';

  var API_KEY = '3233a6f8daddbe93b3745300d542f922';
  var userId = '69923263@N03';

  var util = {
    objToQueryString: function(obj) {
      var result = '';
      for (var key in obj) {
        result += key + '=' + obj[key] + '&';
      }
      if (result.length) result = result.slice(0, result.length - 1);
      return result;
    }
  };

  var sendAPIrequest = function(opts) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', 'https://api.flickr.com/services/rest/?' + util.objToQueryString(opts));
      // &method=flickr.people.getPublicPhotos&api_key=' + API_KEY + '&user_id=' + userId + '&format=json
      // req.open('GET', 'https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&api_key=' + API_KEY + '&user_id=' + userId + '&format=json');

      req.onload = function() {
        if (req.status == 200) {
          resolve(req.response);
        } else {
          reject(Error(req.statusText));
        }
      };
      req.onerror = function() {
        reject(Error("Network Error"));
      };
      req.send();
    });
  };

  var container = document.querySelector('#showContainer');
  sendAPIrequest({
    method: 'flickr.people.getPublicPhotos',
    api_key: API_KEY,
    user_id: userId,
    format: 'json'
  }).then(function(resp) {
    // beacause Flickr is return jsonFlickrApi([data])
    var jsonFlickrApi = function(data) {
      console.log(data);
    };
    // not the best solution because because can be dangerous, but the shortest
    // other way: remove jsonFlickrApi() from string response, and parse using JSON.parse()
    eval(resp);
  }, function() {
    console.log(arguments);
  });

  console.log(container);

})();
