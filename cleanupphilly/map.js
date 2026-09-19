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
  const style = map.getStyle();
  style.layers.forEach((layer) => {
    if (layer.type === "symbol") {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  });

  fetch("data/philadelphia-neighborhoods.geojson")
    .then((res) => res.json())
    .then((data) => {
      // Replace underscores with spaces in every feature's NAME property
      data.features.forEach((feature) => {
        if (feature.properties.NAME) {
          feature.properties.NAME = feature.properties.NAME.replace(/_/g, " ");
        }
      });
      // adding a mask so users only see philly
      const cleanedData = turf.truncate(data, { precision: 6, coordinates: 2 });
      const philly = turf.combine(cleanedData);

      // big rectangle that encapsulates the rest of the world 
      const world = turf.polygon([[
        [-180, -85],
        [180, -85],
        [180, 85],
        [-180, 85],
        [-180, -85],
      ]]);

      // subtract philly from rectangle
      const mask = turf.difference(world, philly.features[0]);

      // fill layer first so the rest of the data lays on top
      map.addLayer({
        id: "philly-mask",
        type: "fill",
        source: {
          type: "geojson",
          data: mask,
        },
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 1,
        },
      });

      map.addLayer({
        id: "philNeighborhood_Labels",
        type: "symbol",
        source: {
          type: "geojson",
          data: data,
        },
        layout: {
          "text-field": ["get", "NAME"],
          "text-size": 12,
          "text-anchor": "center",
          "text-font": ["Playfair Display Regular", "Open Sans Regular"],
        },
        paint: {
          "text-color": "#000000",
        },
      });

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
        }
      );

      map.addLayer({
        id: "sanitationCC",
        type: "circle",
        source: {
          type: "geojson",
          data: "data/Sanitation_Convenience_Centers.geojson",
        },
        paint: {
          "circle-color": "#7fcdbb",
          "circle-radius": 6,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
        },
      });

      map.addLayer({
        id: "permLandfill",
        type: "circle",
        source: {
          type: "geojson",
          data: "data/Permitted_Landfills.geojson",
        },
        paint: {
          "circle-color": "#fa9fb5",
          "circle-radius": 6,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
        },
      });

      map.addLayer({
        id: "philNeighborhood",
        type: "fill",
        source: {
          type: "geojson",
          data: data,
        },
        paint: {
          "fill-color": "#edf8b1",
          "fill-opacity": 0.2,
          "fill-outline-color": "#000000",
        },
      });
    }); 
}); 