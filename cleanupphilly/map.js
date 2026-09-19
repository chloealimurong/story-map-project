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
          1, "#f7fcb9",
          10, "#addd8e",
          25, "#31a354",
        ],
      },
    },
    "road-label-simple"
  );
  map.addLayer(
    {
      id: "sanitationCC",
      type: "circle",
      source: {
        type: "geojson",
        data: "data/Sanitation_Convenience_Centers.geojson",
      },
      paint:
      {
        "circle-color": "#7fcdbb",
        "circle-radius": 6,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1,
      },
    },
  );
  map.addLayer(
    {
      id: "permLandfill",
      type: "point",
      source: {
        type: "geojson",
        data: "data/Permitted_Landfills.geojson",
      },
      paint: 
      {
        "point-color": "#fa9fb5",
        "point-radius": 6,
        "point-stroke-color":"#ffffff",
        "point-stroke-width": 1,
      }
    }
  );
  map.addLayer(
    {
      id: "philNeighborhood",
    type: "fill",
    source: {
      type: "geojson",
      data: "data/philadelphia-neighborhoods.geojson", 
    },
    paint: {
      "fill-color": "#edf8b1",
      "fill-opacity": 0.2,
      "fill-outline-color": "#000000",
    },
    }
  )
  map.addLayer(
    {
      id: "philNeighborhood_Labels",
      type: "symbol",
      source: {
        type: "geojson",
        data: "data/philadelphia-neighborhoods.geojson",
      },
      layout: {
        "text-field": ["get", "NAME"],
        "text-size": 30,
        "text-anchor": center,
      },
    paint: {
      "text-color": "#000000",
      "text-size": 60
    },
  }
  )
});