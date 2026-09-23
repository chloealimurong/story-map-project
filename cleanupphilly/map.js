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
map.scrollZoom.disable();

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
      // replace underscores with spaces in name
      data.features.forEach((feature) => {
        if (feature.properties.NAME) {
          feature.properties.NAME = feature.properties.NAME.replace(/_/g, " ");
        }
      });
      
      // drop-down neighborhood list
      const select = document.getElementById("neighborhood-select");
      const sortedNames = data.features
        .map((f) => f.properties.NAME)
        .sort();

      sortedNames.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
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

      // mask goes first so everything else draws on top of it
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

      // select neighborhood outline
      map.addSource("select-neighborhood", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });

      select.addEventListener("change", (e) => {
        const chosenName = e.target.value;
        if (!chosenName) return;

        const feature = data.features.find((f) => f.properties.NAME === chosenName);
        if (!feature) return;

        map.getSource("select-neighborhood").setData({
          type: "FeatureCollection",
          features: [feature],
        });

        const bbox = turf.bbox(feature);
        map.fitBounds(bbox, { padding: 60 });
      });

      // philly neighborhood labels
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

      // illegal dumping hexagons
      map.addLayer({
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
      });

      // sanitation convenience centers
      map.loadImage("data/sanitation_symbol.png", (error, image) => {
        map.addImage("sanitation-icon", image);

      map.addLayer({
        id: "sanitationCC",
        type: "symbol",
        source: {
          type: "geojson",
          data: "data/Sanitation_Convenience_Centers.geojson",
        },
        layout: {
          "icon-image": "sanitation-icon",
          "icon-size": 0.08,
          "icon-allow-overlap": true,
        },
      });

      // underlying philly neighborhood overlay (just a fancy yellow highlight)
      map.addLayer({
        id: "philNeighborhood",
        type: "fill",
        source: {
          type: "geojson",
          data: data,
        },
        paint: {
          "fill-color": "#edf8b1",
          "fill-opacity": 0.1,
          "fill-outline-color": "#000000",
        },
      });

      // recycle diversion rate
      map.addLayer({
        id: "recycleRate",
        type: "fill",
        source: {
          type: "geojson",
          data: "data/Recycling_Diversion_Rate.geojson",
        },
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "score"],
            0, "#f1eef6",
            10, "#bdc9e1",
            20, "#74a9cf",
            30, "#0570b0",
          ],
          "fill-opacity": 1,
          "fill-outline-color": "#ffffff",
        },
      });

      // recycling centers
      map.loadImage("data/recycling_symbol.png", (error, image) => {
        map.addImage("recycle-icon", image);

      map.addLayer({
        id: "recycleSites",
        type: "symbol",
        source: {
          type: "geojson",
          data: "data/Recycling_Donation_Sites.geojson",
        },
        layout: {
          "icon-image": "recycle-icon",
          "icon-size": 0.05,
          "icon-allow-overlap": false,
        },
      });

      // landfills
      map.loadImage("data/trashcan-icon.png", (error, image) => {
        map.addImage("landfill-icon", image);

        map.addLayer({
          id: "permLandfill",
          type: "symbol",
          source: {
            type: "geojson",
            data: "data/Permitted_Landfills_WGS84.geojson",
          },
          layout: {
            "icon-image": "landfill-icon",
            "icon-size": 0.05,
            "icon-allow-overlap": true,
          },
          filter: ["within", philly],
        });

        map.addLayer({
        id: "select-neighborhood-outline",
        type: "line",
        source: "select-neighborhood",
        paint: {
          "line-color": "#c51b8a",
          "line-width": 3,
          },
        });

        // slides and their corresponding layers 
        function updateLayers(slideId) {
          const mapElement = document.getElementById("map");
          const fifthImage = document.getElementById("fifth-slide-image");

          mapElement.style.display = "block";
          fifthImage.style.display = "none";

          if (slideId === "fifth-slide") {
            mapElement.style.display = "none";
            fifthImage.style.display = "block";
          }

          map.setLayoutProperty("illegalDumping", "visibility", "none");
          map.setLayoutProperty("sanitationCC", "visibility", "none");
          map.setLayoutProperty("permLandfill", "visibility", "none");
          map.setLayoutProperty("recycleSites", "visibility", "none");
          map.setLayoutProperty("recycleRate", "visibility", "none");

          if (slideId === "title-slide" || slideId === "second-slide") {
            map.setLayoutProperty("recycleSites", "visibility", "visible")
          }

          if (slideId === "third-slide" || slideId === "fourth-slide") {
            map.setLayoutProperty("illegalDumping", "visibility", "visible");
          }

          if (slideId === "fourth-slide") {
            const targetNames = ["JUNIATA PARK", "UPPER KENSINGTON", "PORT RICHMOND"]; 
            const selectedFeatures = data.features.filter((f) =>
                targetNames.includes(f.properties.NAME)
              );

              if (selectedFeatures.length > 0) {
                const combined = turf.combine(turf.featureCollection(selectedFeatures));
                const bbox = turf.bbox(combined);
                map.fitBounds(bbox, { padding: 80 });
              }
          }
          if (slideId === "fifth-slide") {
            map.fitBounds(
              [
                [-75.4, 39.85],
                [-74.85, 40.15],
              ],
              { padding: 40 }
            );
          }

          if (slideId === "sixth-slide") {
            map.setLayoutProperty("sanitationCC", "visibility", "visible");
            map.setLayoutProperty("permLandfill", "visibility", "visible");
            map.setLayoutProperty("recycleSites", "visibility", "visible");
          }

          if (slideId === "seventh-slide") {
            map.setLayoutProperty("recycleRate", "visibility", "visible");
          }
        } 

        const slideObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                updateLayers(entry.target.id);
              }
            });
          },
          { threshold: 0.1 }
        );

        document.querySelectorAll(".slide").forEach((slide) => {
          slideObserver.observe(slide);
        });

        updateLayers("title-slide"); // set initial state once everything exists
      });
      });
      }); 
    }); // closes .then((data) => {...})
}); // closes map.on("load", function () {...})