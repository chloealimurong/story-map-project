mapboxgl.accessToken = "pk.eyJ1IjoiY2hsb2VhbGltdXJvbmciLCJhIjoiY210dWR0cjcyMDBiNjM0cHFvN2p4b2RpMiJ9.EHtMZkiC7TklHIn836JPoQ";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/chloealimurong/cmu4ig71o004101sa7mzl7prl",
  zoom: 10.5,
  center: [-75.1, 39.99],
  maxZoom: 15,
  minZoom: 8,
  maxBounds: [
    [-75.4, 39.85], 
    [-74.85, 40.15]
  ],
});

map.on("load", function () {
  map.addLayer(
    {
      id: "illegalDumping",
      type: "fill",
      source: {
        type: "geojson",
        data: "data/hex_illegal_dumping.geojson",
      },
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["get", "count_"],
          1, "#ff4400",
          10, "#ffba31",
          25, "#ffffff",
        ],
      },
    },
    "road-label-simple"
  );
});

map.on("click", "turnstileData", function (e) {
  var entriesDiff = e.features[0].properties.ENTRIES_DIFF;
  var entries_06 = e.features[0].properties.ENTRIES_06;
  var entries_20 = e.features[0].properties.ENTRIES_20;
  var stationName = e.features[0].properties.stationName;
  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(
      "<h4>" + stationName + "</h4>" +
        "<p><b>Friday, March 6th:</b> " + entries_06 + " entries<br>" +
        "<b>Friday, March 20th:</b> " + entries_20 + " entries<br>" +
        "<b>Change:</b> " + Math.round(entriesDiff * 1000) / 10 + "%</p>"
    )
    .addTo(map);
});

map.on("mouseenter", "turnstileData", function () {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "turnstileData", function () {
  map.getCanvas().style.cursor = "";
});