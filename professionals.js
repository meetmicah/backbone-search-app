console.log('loaded');
// declare the Professionals Model
var Professionals = Backbone.Model;
// Now we're going to create a collection
var ProfessionalsCollection = Backbone.Collection.extend({
  model: Professionals,
  url: '/search.json',
  parse: function (response) {
    return response.professionals;
  }
});

// Create the View
var ProfessionalsSerp = Backbone.View.extend({
  // The element it will use.
  el: '.results',
  // What will happen in said element.
  render: function() {
    // will need this later
    console.log('began rendering');
    var thisVal = this;
    // so I do not have to write ProfessionalsCollection every time
    var professional = new ProfessionalsCollection();
    // fetch the data
    professional.fetch({
      // when fetch is successful, pass the data to the collection
      success: function(ProfessionalsCollection) {
        // using this template
        var template = _.template(
          $('#professionals-template').html(),
          {professionals: ProfessionalsCollection.models}
        );
        thisVal.$el.html(template);
        var Map = Backbone.View.extend({
          el: $('#map'),
          initialize: function() {
            this.$el.height(350);
            this.initMap();
          },
          initMap: function() {
            // where google maps centers to start with
            this.latLng = new google.maps.LatLng(29.489880,-98.543600);
            // default zoom and center for map
            this.options = {
              zoom: 12,
              center: this.latLng
            };

            this.map = new google.maps.Map($('#map')[0], this.options);
            this.markers = [];
            this.bouncingMarkers = [];
            this.infoWindow = {};
            var thisVal = this;
            _(ProfessionalsCollection.models).each(function(professional){
              thisVal.markers.push(new google.maps.Marker({
                position: new google.maps.LatLng(
                  professional.get('locations')[0]['address']['latitude'],
                  professional.get('locations')[0]['address']['longitude']
                ),
                map: thisVal.map,
                id: professional.get('id'),
                icon: 'red-pin.png'
              }));
            });
          },
          getMarker: function(id) {
            var result;
            _(this.markers).each(function(marker) {
              if (marker['id'] === id) {
                result = marker;
              }
            });
            return result;
          },
          bounceMarker: function(id) {
            var marker = this.getMarker(id);
            // Set the map position to focus on this professionals marker.
            this.map.setCenter(new google.maps.LatLng(
              marker.position.H,
              marker.position.L
              )
            );
            // I bounce this marker for 3 secs.
            marker.setAnimation(google.maps.Animation.BOUNCE);
            // push markers id into array as a currently bouncing marker.
            this.bouncingMarkers.push(marker['id']);
            // I reset the marker animation after a delay.
            window.setTimeout(function() {
              marker.setAnimation(null);
              // marker.setIcon('red-pin.png');
            }, 750);
            var infowindow = new google.maps.InfoWindow({
              content: "foo"
            });
            this.infoWindows[professional.id].open(map, marker);
          }
        });
        map = new Map();
      },
    });
  }
});

(new ProfessionalsSerp()).render();