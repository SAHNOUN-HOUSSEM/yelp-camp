mapboxgl.accessToken = mbxAccessToken

const campgroundsFeatures = campgrounds.map(campground => {
    return (
        {
            type: "Feature",
            properties: {
                _id: campground._id,
                title: campground.title,
                description: campground.description
            },
            geometry: campground.point
        }
    )
})

const sourceData = {
    type: "FeatureCollection",
    features: campgroundsFeatures
}

const map = new mapboxgl.Map({
    container: 'map',
    zoom: 4,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-103.5917, 40.6699]
})

map.addControl(new mapboxgl.NavigationControl());

map.on("load", () => {
    //adding the source data for cluster layers
    map.addSource("campgrounds", {
        type: "geojson",
        // data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
        data: sourceData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    })

    //adding the cluster layer
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'], //input
                '#208b3a',  //0->10
                10,//first stop
                '#fcec52', //10->20
                25,//second stop
                '#fbb040',  //20->40
                50,//third stop
                "#f26b21",
                75,
                '#be1e2d', //10->20
                100,
                '#f7887d', //10->20
                200,
                '#287271', //10->20
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'], //input
                10,  //0->10
                10,//first stop
                15, //10->20
                25,//second stop
                20,  //20->40
                50,//third stop
                25,
                75,
                30, //10->20
                100,
                35, //10->20
                200,
                40, //10->20
            ],
        }
    });

    //adding cluster count layer
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    //adding unclustered points layer(the particular campground)
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        console.log(e.point);
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { title, _id, description } = e.features[0].properties;
        const popupMarkup =
            `
                <strong><a href="/campgrounds/${_id}">${title}</a></strong>
                <p>${description}</p>
            `
        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popupMarkup)
            .addTo(map);
    });

    map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
})