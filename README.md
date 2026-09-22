# [Clean Up Philadelphia](https://chloealimurong.github.io/story-map-project/cleanupphilly)
A scrollytelling story map on excess waste in Philadelphia. Built by Chloe Alimurong, MUSA 6110.

## Content Overview

1. **Title** Project intro.
2. **Waste and Philadelphia** Cost and scale of illegal dumping, per the September 2026 City Controller report.
3. **Illegal Dumping in Hexagons** Hexbin map (H3, resolution 9) of reported incidents.
4. **19134** Focus on Kensington, Juniata Park, and Port Richmond: highest report counts and highest poverty rate.
5. **Source of Waste** Contractor dumping and household dumping as contributing causes.
6. **Alternatives and Accessibility** Map of sanitation centers, landfills, and recycling sites.
7. **How Your Neighborhood Did** Recycling diversion rate by neighborhood, 2025.
8. **Sources** Full citations.

## Data Sources

- [Philadelphia Controller: September 2026 Municipal Money Matters](https://controller.phila.gov/philadelphia-reports/september-2026-municipal-money-matters/)
- [Illegal Dumping by Hex Bins](https://metadata.phila.gov/#home/datasetdetails/5543864d20583086178c4e98/representationdetails/675a0c767cd90802cb96d76e/)
- [Report Illegal Dumping Form](https://www.phila.gov/services/trash-recycling-city-upkeep/report-a-problem-with-trash-recycling-or-city-upkeep/report-illegal-dumping/)
- [Illegal Dumpsites Cleanup Cost Philadelphia Taxpayers](https://www.phillyvoice.com/illegal-dumpsites-cleanup-cost-philadelphia-taxpayers/)
- [How Philly Fights Illegal Dumping](https://thephiladelphiacitizen.org/how-philly-fights-illegal-dumping/)
- [Poverty by Zip Code in Philadelphia](https://zipatlas.com/us/pa/philadelphia/zip-code-comparison/highest-poverty.htm)
- [Recycling Sites](https://opendataphilly.org/datasets/recycling-donations-resources/)
- [Recycling Diversion Rate](https://opendataphilly.org/datasets/recycling-diversion-rate/)
- [Sanitation Convenience Centers](https://opendataphilly.org/datasets/sanitation-convenience-centers/)
- [Permitted Landfills](https://services1.arcgis.com/Nifc7wlHaBPig3Q3/arcgis/rest/services/Permitted_Landfills/FeatureServer)
- Philadelphia neighborhood boundaries, City of Philadelphia

## Images

- [Philadelphia Illegal Dump Site Second Slide Image](https://www.audacy.com/kywnewsradio/news/local/philadelphia-illegal-dump-sites-map)
- [Philadelphia Illegal Dump Site Fifth Slide Image](https://philly-stat-360-phl.hub.arcgis.com/pages/illegal-dumping)

## Technical Details

- Mapbox GL JS v3.7.0
- Turf.js v6, for the Philly mask and boundary dissolve
- GeoJSON data, converted from Shapefile using QGIS
- Scrollytelling built with `IntersectionObserver`, no external library
- Style reference: [Mapbox Storytelling tutorial](https://pointsunknown.nyc/web%20mapping/mapbox/2021/07/20/11A_MapboxStorytelling.html)
- Color palette: [ColorBrewer](https://colorbrewer2.org/#type=sequential&scheme=BuGn&n=3)

## Acknowledgments

AI (Claude, Sonnet 5) was used to debug code in this story map.
