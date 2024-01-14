mapboxgl.accessToken = mbxAccessToken

const campground = JSON.parse(c)

const popupHTML = `<strong>${campground.title}</strong>
                    <p>${campground.description}</p>`

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 15,
    center: campground.point.coordinates
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

const markerElt = document.createElement("div")
markerElt.style.backgroundImage=`url(${campground.images[0].url})`
// markerElt.style.backgroundImage=campground.images[0]
markerElt.style.borderRadius="100%"
markerElt.style.width="20px"
markerElt.style.height="20px"
markerElt.style.backgroundSize="100%"

const marker = new mapboxgl.Marker(markerElt)
    .setLngLat(campground.point.coordinates)
    .setPopup(new mapboxgl.Popup().setHTML(popupHTML))
    .addTo(map)