'use strict';

/* Controllers */

angular.module('odyssey.controllers', []).
  controller('SearchCtrl', function($scope, $http, $cookieStore, $cookies, foursquareResource, foursqResource, Trip, Destination, currentCity) {
  	
    Array.prototype.chunk = function(chunkSize) {
      var array=this;
      return [].concat.apply([],
          array.map(function(elem,i) {
              return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
          })
      );
    }

    delete $http.defaults.headers.common["X-Requested-With"];
  	$scope.destinations = gon.destinations;
    $scope.explories = [];
    $scope.trip_id = gon.trip.id;
    $scope.current_city = gon.trip.name;
    $scope.current_lat = gon.trip.current_lat;
    $scope.current_lng = gon.trip.current_lng;
    $scope.isCollapsed = true;
    $scope.isLoading = false;

    angular.extend($scope, {
      center: {
        latitude: gon.trip.current_lat, // initial map center latitude
        longitude: gon.trip.current_lng, // initial map center longitude
      }, // an array of markers,
      zoom: 11, // the zoom level
    });

    $scope.explore = function(){
      var exploreRes = foursqResource.get({'aspect': 'explore', 'll': $scope.current_lat + ',' + $scope.current_lng, 'venuePhotos': 1 }, 
        function(){
          $scope.explories = exploreRes.response.groups[0].items;
          $scope.explories = $scope.explories.chunk(3);
          return $scope.explories
      });
    }

    $scope.addDestination = function(venue){
      var photo_url = venue.photos.groups[0].items[0].prefix + '200x200' + venue.photos.groups[0].items[0].suffix;
      var l = {'trip_id': $scope.trip_id, 'name': venue.name, 'photo_url': photo_url, 'latitude': venue.location.lat, 'longitude': venue.location.lng};
      var d = angular.extend(l, venue.location);
      new Destination(d).create();
      $scope.destinations.unshift(d);
      //$scope.markers.push({latitude: venue.location.lat, longitude: venue.location.lng});
    }

    $scope.getSuggestions = function(){

      var opts = {
        'url' : 'https://api.foursquare.com/v2/venues/suggestCompletion?',
        'client_id'     : 'AAUXORIZZ1CNKYBDNXUINODGQT24W2XO3IQAFIZ04Y0YBWVQ',
        'client_secret' : 'L0KWGXINDGXNCHLBPQKDBVY4QPARCWZLTSKJPBMV11ICADCX',
        'll' : $scope.current_lat + ',' + $scope.current_lng, 
        //'ll' : '40.7,-74.0',
        'limit' : 10,
        'v' : '20130715',
      }



      var url = opts.url 
        + "query=" + $scope.placeQuery
        + "&ll=" + opts.ll 
        + "&v=" + opts.v 
        + "&limit=" + opts.limit
        + "&client_id=" + opts.client_id
        + "&client_secret=" + opts.client_secret;

      

      $http({method: 'GET', url: url}).
        success(function(data, status, headers, config) {
          $scope.suggestions = [];
          $scope.suggestions = data.response.minivenues;
        }).
        error(function(data, status, headers, config) {});

      return $scope.suggestions;
    }

    $scope.onSelect = function($item, $model, $label){
      var d = angular.extend({
        'trip_id': $scope.trip_id, 
        'name': $model.name, 
        'photo_url': '',
        'latitude': $model.location.lat,
        'longitude': $model.location.lng,
        }, $model.location);

      $scope.destinations.unshift(d);
      var photo = foursquareResource.get({'venueId': $model.id}, function(){
      	var photo_url = photo.response.photos.items[0].prefix + "200x200" + photo.response.photos.items[0].suffix;
      	$scope.destinations[0].photo_url = photo_url;
        new Destination($scope.destinations[0]).create();
      });
      $scope.placeQuery = "";
      //$scope.markers.push({latitude: $model.data.location.lat, longitude: $model.data.location.lng});
    }
  })
  .controller('HomeCtrl', function($scope, $http) {
  	  $scope.gPlace;
	  $scope.current_city;
  });