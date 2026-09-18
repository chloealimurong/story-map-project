library(sf)

landfills <- st_read("/Users/chloealimurong//Downloads/Permitted_Landfills/Permitted_Landfills.shp")

# Check the CRS — Mapbox needs WGS84 (EPSG:4326)
st_crs(landfills)

# reproject:
landfills <- st_transform(landfills, crs = 4326)

st_write(landfills, "/Users/chloealimurong/GitHub/story-map-project/cleanupphilly/data/Permitted_Landfills.geojson")