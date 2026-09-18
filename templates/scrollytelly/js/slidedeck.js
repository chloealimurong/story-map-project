/**
 * A slide deck object (Mapbox GL JS version)
 */
class SlideDeck {
  /**
   * Constructor for the SlideDeck object.
   * @param {Node} container The container element for the slides.
   * @param {NodeList} slides A list of HTML elements containing the slide text.
   * @param {mapboxgl.Map} map The Mapbox GL map where data will be shown.
   * @param {object} slideOptions Paint options for each slide's layers, keyed by slide ID.
   *                              e.g. { "second-slide": { circlePaint: {...} } }
   */
  constructor(container, slides, map, slideOptions = {}) {
    this.container = container;
    this.slides = slides;
    this.map = map;
    this.slideOptions = slideOptions;

    this.sourceId = 'slide-data';
    this.currentSlideIndex = 0;
    this.activePopups = [];

    this._initLayers();
  }

  /**
   * Set up an empty GeoJSON source and the point/line/polygon layers that
   * will render whatever data gets loaded for the current slide.
   */
  _initLayers() {
    const emptyCollection = { type: 'FeatureCollection', features: [] };

    if (!this.map.getSource(this.sourceId)) {
      this.map.addSource(this.sourceId, {
        type: 'geojson',
        data: emptyCollection,
      });

      this.map.addLayer({
        id: `${this.sourceId}-polygons`,
        type: 'fill',
        source: this.sourceId,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': '#3388ff',
          'fill-opacity': 0.4,
          'fill-outline-color': '#3388ff',
        },
      });

      this.map.addLayer({
        id: `${this.sourceId}-lines`,
        type: 'line',
        source: this.sourceId,
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: {
          'line-color': '#3388ff',
          'line-width': 2,
        },
      });

      this.map.addLayer({
        id: `${this.sourceId}-points`,
        type: 'circle',
        source: this.sourceId,
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-radius': 6,
          'circle-color': '#3388ff',
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 1,
        },
      });
    }
  }

  /**
   * ### updateDataLayer
   *
   * Replace the GeoJSON source's data with the data provided, and apply any
   * per-slide paint overrides passed in via slideOptions.
   *
   * @param {object} data A GeoJSON FeatureCollection object
   * @param {object} options Optional paint overrides for this slide's layers
   *                         e.g. { circlePaint: {...}, linePaint: {...}, fillPaint: {...} }
   * @return {object} The data that was set, for convenience (bounds calc, etc.)
   */
  updateDataLayer(data, options = {}) {
    // Clear old popups from the previous slide
    this.activePopups.forEach((p) => p.remove());
    this.activePopups = [];

    const source = this.map.getSource(this.sourceId);
    source.setData(data);

    if (options.circlePaint) {
      Object.entries(options.circlePaint).forEach(([key, val]) =>
        this.map.setPaintProperty(`${this.sourceId}-points`, key, val)
      );
    }
    if (options.linePaint) {
      Object.entries(options.linePaint).forEach(([key, val]) =>
        this.map.setPaintProperty(`${this.sourceId}-lines`, key, val)
      );
    }
    if (options.fillPaint) {
      Object.entries(options.fillPaint).forEach(([key, val]) =>
        this.map.setPaintProperty(`${this.sourceId}-polygons`, key, val)
      );
    }

    return data;
  }

  /**
   * ### getSlideFeatureCollection
   *
   * Load the slide's features from a GeoJSON file.
   *
   * @param {HTMLElement} slide The slide's HTML element. The element id should match the key for the slide's GeoJSON file
   * @return {object} The FeatureCollection as loaded from the data file
   */
  async getSlideFeatureCollection(slide) {
    const resp = await fetch(`data/${slide.id}.json`);
    const data = await resp.json();
    return data;
  }

  /**
   * ### hideAllSlides
   *
   * Add the hidden class to all slides' HTML elements.
   *
   * @param {NodeList} slides The set of all slide elements, in order.
   */
  hideAllSlides() {
    for (const slide of this.slides) {
      slide.classList.add('hidden');
    }
  }

  /**
   * Compute a mapboxgl.LngLatBounds from a bbox array [west, south, east, north].
   */
  _boundsFromBbox(bbox) {
    const [west, south, east, north] = bbox;
    return new mapboxgl.LngLatBounds([west, south], [east, north]);
  }

  /**
   * Compute a mapboxgl.LngLatBounds by walking every coordinate in a
   * GeoJSON FeatureCollection (used when the collection has no bbox).
   */
  _boundsFromCollection(collection) {
    const bounds = new mapboxgl.LngLatBounds();

    const extendWithCoords = (coords) => {
      if (typeof coords[0] === 'number') {
        // it's a single [lng, lat] pair
        bounds.extend(coords);
      } else {
        coords.forEach(extendWithCoords);
      }
    };

    collection.features.forEach((feature) => {
      if (feature.geometry && feature.geometry.coordinates) {
        extendWithCoords(feature.geometry.coordinates);
      }
    });

    return bounds;
  }

  /**
   * ### syncMapToSlide
   *
   * Go to the slide that matches the specified ID.
   *
   * @param {HTMLElement} slide The slide's HTML element
   */
  async syncMapToSlide(slide) {
    const collection = await this.getSlideFeatureCollection(slide);
    const options = this.slideOptions[slide.id];
    this.updateDataLayer(collection, options);

    const bounds = collection.bbox
      ? this._boundsFromBbox(collection.bbox)
      : this._boundsFromCollection(collection);

    /**
     * Once the map finishes flying to the new bounds, show popups
     * for point features if this slide wants them (slide.showpopups),
     * mirroring the original "permanent tooltip" behavior.
     */
    const handleMoveEnd = () => {
      if (slide.showpopups) {
        collection.features.forEach((feature) => {
          if (
            feature.geometry.type === 'Point' &&
            feature.properties &&
            feature.properties.label
          ) {
            const popup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false })
              .setLngLat(feature.geometry.coordinates)
              .setText(feature.properties.label)
              .addTo(this.map);
            this.activePopups.push(popup);
          }
        });
      }
    };

    this.map.once('moveend', handleMoveEnd);

    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, { padding: 40 });
    }
  }

  /**
   * Show the slide with ID matched by currentSlideIndex. If currentSlideIndex is
   * null, then show the first slide.
   */
  syncMapToCurrentSlide() {
    const slide = this.slides[this.currentSlideIndex];
    this.syncMapToSlide(slide);
  }

  /**
   * Increment the currentSlideIndex and show the corresponding slide. If the
   * current slide is the final slide, then the next is the first.
   */
  goNextSlide() {
    this.currentSlideIndex++;

    if (this.currentSlideIndex === this.slides.length) {
      this.currentSlideIndex = 0;
    }

    this.syncMapToCurrentSlide();
  }

  /**
   * Decrement the currentSlideIndex and show the corresponding slide. If the
   * current slide is the first slide, then the previous is the final.
   */
  goPrevSlide() {
    this.currentSlideIndex--;

    if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = this.slides.length - 1;
    }

    this.syncMapToCurrentSlide();
  }

  /**
   * ### preloadFeatureCollections
   *
   * Initiate a fetch on all slide data so that the browser can cache the
   * requests. This way, when a specific slide is loaded it has a better chance
   * of loading quickly.
   */
  preloadFeatureCollections() {
    for (const slide of this.slides) {
      this.getSlideFeatureCollection(slide);
    }
  }

  /**
   * Calculate the current slide index based on the current scroll position.
   */
  calcCurrentSlideIndex() {
    // Height of the viewport
    const windowHeight = window.innerHeight;

    // How far down the page we've scrolled so far; calculated from the top of
    // the page
    const scrollPos = window.scrollY;

    // Amount of next slide that must be visible above the bottom of the window
    // to trigger a slide transition
    const scrollPeek = 64;

    // When the next slide peeks above the bottom of the viewport a certain
    // amount, we consider that we've reached the next slide.
    const currentSlideThreshold = scrollPos + windowHeight - scrollPeek;

    // Create a variable to hold the index of each slide as we check it.
    let i;

    // Start from the last slide and work backwards to find the current slide.
    for (i = this.slides.length - 1; i > 0; i--) {
      const slidePos
        = this.slides[i].offsetTop + this.container.offsetTop;
      if (slidePos <= currentSlideThreshold) {
        break;
      }
    }

    if (i !== this.currentSlideIndex) {
      this.currentSlideIndex = i;
      this.syncMapToCurrentSlide();
    }
  }
}

export { SlideDeck };