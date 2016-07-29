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

  function PhotoView(container) {
    var page = 1;
    var self = this;

    var renderPicture = function(opts) {
      var element = document.createElement('div');
      element.classList.add('showContainer__photo');
      element.setAttribute('tabindex', opts.index);

      if (opts.isActive) {
        element.focus();
        // element.classList.add('showContainer__photo_active');
      }

      element.setAttribute('data-id', opts.id);
      element.classList.add('showContainer__photo_loading');
      return element;
    };

    var loadPictures = function() {
      [].forEach.call(container.querySelectorAll('.showContainer__photo_loading'), function(el) {
        sendAPIrequest({
          method: 'flickr.photos.getSizes',
          api_key: API_KEY,
          photo_id: el.getAttribute('data-id'),
          format: 'json',
        }).then(function(resp) {
          var data = resp.slice('jsonFlickrApi('.length, resp.length - 1);
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.log(e);
          }
          var mediumPic = data.sizes.size.find(function(pic) {
            return pic.height >= 320 && pic.height >= 222;
          });
          var pic = document.createElement('img');
          pic.src = mediumPic.source;
          el.innerHTML = '';
          el.classList.remove('showContainer__photo_loading');
          el.appendChild(pic);

          // if (initialLoad) {
          //   mediumPic.isActive = true;
          //   initialLoad = false;
          // }
          // mediumPic.index = index;
          // el.innerHTML = '';
          // el.appendChild(renderPicture(mediumPic));
        });
      });
    };

    // initialize
    // (function() {
    sendAPIrequest({
      method: 'flickr.people.getPublicPhotos',
      api_key: API_KEY,
      user_id: userId,
      format: 'json',
      per_page: 50
    }).then(function(resp) {
      var initialLoad = true;
      // beacause Flickr is return jsonFlickrApi([data])
      var jsonFlickrApi = function(data) {
        var photos = data.photos.photo;
        photos.forEach(function(el, index) {
          el.index = (index + 1);
          container.appendChild(renderPicture(el));
        });
        loadPictures();
      };
      // not the best solution because eval() can be dangerous, but the shortest
      // other way: remove jsonFlickrApi() from string response, and parse using JSON.parse()
      eval(resp);
    }, function() {
      console.log(arguments);
    });
    // })();

    self.nextPage = function() {

    }

    var moveDown = function() {
      var current = container.querySelector('.showContainer__photo:focus');
      var index = current.getAttribute('tabindex');
      var newOne = container.querySelector('.showContainer__photo[tabindex="' + (Number(index) + 5) + ']');
      if (newOne) {
        newOne.focus();
      }
    };

    var moveUp = function() {
      var current = container.querySelector('.showContainer__photo:focus');
      var index = current.getAttribute('tabindex');
      var newOne = container.querySelector('.showContainer__photo[tabindex="' + (Number(index) - 5) + ']');
      if (newOne) {
        newOne.focus();
      }
    };


    var moveRight = function() {
      var current = container.querySelector('.showContainer__photo:focus');
      var newOne = current.nextSibling;
      if (newOne) {
        newOne.focus();
      }
    };

    var moveLeft = function() {
      var current = container.querySelector('.showContainer__photo:focus');
      var newOne = current.previousSibling;
      if (newOne) {
        newOne.focus();
      }
    };


    self.moveFocus = function(e) {
      console.log('e ', e);
      switch (e.keyCode) {
        case 40:
          moveDown();
          break;
        case 39:
          moveRight();
          break;
        case 38:
          console.log('up');
          break;
        case 37:
          moveLeft();
          console.log('left');

      }
    };

  }

  var photoView = new PhotoView(document.querySelector('#showContainer'));

  document.onkeydown = function(e) {
    console.log('e ', e);
    // e.preventDefault();
    // log
    photoView.moveFocus(e);
  }


})();
