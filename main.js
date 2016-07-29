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
          // beacause Flickr is return jsonFlickrApi([data])
          var data = req.response.slice('jsonFlickrApi('.length, req.response.length - 1);
          try {
            data = JSON.parse(data);
            resolve(data);
          } catch (e) {
            console.error(e);
            resolve({});
          }
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


    // initialize
    sendAPIrequest({
      method: 'flickr.people.getPublicPhotos',
      api_key: API_KEY,
      user_id: userId,
      format: 'json',
      per_page: 50
    }).then(function(resp) {
      var photos = resp.photos.photo;
      photos.forEach(function(el, index) {
        el.index = (index + 1);
        container.appendChild(renderPicture(el));
      });
      loadPictures();
    }, function() {
      console.log(arguments);
    });

    function renderPicture(opts) {
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
    }

    function loadPictures() {
      [].forEach.call(container.querySelectorAll('.showContainer__photo_loading'), function(el) {
        sendAPIrequest({
          method: 'flickr.photos.getSizes',
          api_key: API_KEY,
          photo_id: el.getAttribute('data-id'),
          format: 'json',
        }).then(function(data) {
          var mediumPic = data.sizes.size.find(function(pic) {
            return pic.height >= 320 && pic.height >= 222;
          });
          var pic = document.createElement('img');
          pic.src = mediumPic.source;
          el.innerHTML = '';
          el.classList.remove('showContainer__photo_loading');
          el.appendChild(pic);
        });
      });
    }


    self.nextPage = function() {

    }

    var moveDown = function() {
      var current = container.querySelector('.showContainer__photo:focus');
      var index = current.getAttribute('tabindex');
      var newOne = container.querySelector('.showContainer__photo[tabindex="' + (Number(index) + 5) + '"]');
      if (newOne) {
        newOne.focus();
      } else {
        sendAPIrequest({
          method: 'flickr.people.getPublicPhotos',
          api_key: API_KEY,
          user_id: userId,
          format: 'json',
          per_page: 40,
          page: ++page
        }).then(function(resp){
          var photos = resp.photos.photo;
          photos.forEach(function(el, index) {
            el.index = (index + 1);
            container.appendChild(renderPicture(el));
          });
          var numberToDelete = 0;
          while (container.childNodes.length > 50) {
            container.removeChild(container.childNodes[0]);
            numberToDelete++;
          }
          var currMargin = container.style.margin.match(/(d+)px/g); 
          console.log('currMargin ' , currMargin);
          if (!currMargin) {
            var offset = Math.floor(numberToDelete / 5);
            offset *= container.childNodes[0].offsetHeight;
            container.style.margin = offset + 'px' + ' auto 0 auto';
          }
          // container.style.margin
          if (current) {
            current.focus();
          }
          console.log(current);
          loadPictures();
        });
      }
    };

    var moveUp = function() {
      var current = container.querySelector('.showContainer__photo:focus');
      var index = current.getAttribute('tabindex');
      var selector = '.showContainer__photo[tabindex="' + (Number(index) - 5) + '"]';
      console.log('selector ', selector);
      var newOne = container.querySelector(selector);
      if (newOne) {
        newOne.focus();
      } else {
       
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
      // console.log('e ', e);
      switch (e.keyCode) {
        case 40:
          moveDown();
          break;
        case 39:
          moveRight();
          break;
        case 38:
          console.log('up');
          moveUp();
          break;
        case 37:
          moveLeft();
          console.log('left');

      }
    };

  }

  var photoView = new PhotoView(document.querySelector('#showContainer'));

  document.onkeydown = function(e) {
    // console.log('e ', e);
    // e.preventDefault();
    // log
    photoView.moveFocus(e);
  }


})();
