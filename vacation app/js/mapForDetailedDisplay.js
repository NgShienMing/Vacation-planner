/*
 * File Name: mapForDetailedDisplay.js
 * Purpose: This files contains all the functions that are used for the map in the detailed information.html page, 
 *          where the functions are called in detailed information.js to show relevant information on the map.
 * Team: 154
 * Author: Ng Shien Ming
 * Last Modified: 14/10/2021
*/
"use strict";
// Add the map to the detailed information page
mapboxgl.accessToken = MAPBOX_KEY;
let map = new mapboxgl.Map(
    {
        container: 'map',
        center: [101.6011, 3.0648],
        zoom: 15,
        style: 'mapbox://styles/mapbox/streets-v11'
    }
);
// geojson object for displaying the route on the map
let directionObject = 
{
    type: "geojson", // type
    data:            // data
    {
        type: "Feature",
        properties: {},
        geometry: 
        {
            type: "LineString",
            coordinates: []
        }
    }
};
let addedPOIMarkers = [];
let addedPOIPopups = [];
// Zoom in and out control
map.addControl(new mapboxgl.NavigationControl());
// Get user location control
map.addControl(new mapboxgl.GeolocateControl());
/**
 * showAddedPOIMarkers function
 * This function shows the markers of the saved point of interest list on the map.
 * @param {Array} pointOfInterestArray the array of point of interest
 */
function showAddedPOIMarkers(pointOfInterestArray)
{
    // Reset the addedPOIMarkers and addedPOIPopups array to an empty array
    addedPOIMarkers.length = 0;
    addedPOIPopups.length = 0;
    // This for loop generates the markers and popups for all the added POIs
    for (let i = 0; i < pointOfInterestArray.length; i++)
    {
        // Create new marker for the added POIs
        let addedPOIMarker = new mapboxgl.Marker(
            {
                color: "#2F6998"
            }
        );
        let addedPOIPopup = new mapboxgl.Popup(
            { 
                closeOnClick: false,
                offset: 40
            }
        );
        // Obtain the information of the POI at the current index
        let currentPOI = pointOfInterestArray[i];
        let poiName = currentPOI.name;
        let poiAddress = currentPOI.address;
        let poiType = currentPOI.category;
        let poiCoordinates = currentPOI.coordinates;
        // Set the HTML of the popup to be displayed
        addedPOIPopup.setHTML(`Name: ${poiName}<br>Address: ${poiAddress}<br>Type: ${poiType}`);
        // Set the coordinates of the marker
        addedPOIMarker.setLngLat(poiCoordinates);
        // Add the marker to the map
        addedPOIMarker.addTo(map);
        // Set the popup with the HTML onto the marker
        addedPOIMarker.setPopup(addedPOIPopup);
        // Add the popup to the map
        addedPOIPopup.addTo(map);
        // Push the marker and popup of the added POI into the addedPOIMarkers and addedPOIPopups array respectively
        addedPOIMarkers.push(addedPOIMarker);
        addedPOIPopups.push(addedPOIPopup);
    }
}
/**
 * fitMarkersToMapView function
 * This function fit all the displaying markers to the map view.
 * @param {Array} coordinates the coordinates of each point of interest
 */
function fitMarkersToMapView(coordinates)
{
    // Create new LngLatBounds
    let bounds = new mapboxgl.LngLatBounds();
    // This for loop extends the bounds using the provided coordinates array
    for (let i = 0; i < coordinates.length; i++)
    {
        bounds.extend(coordinates[i]);
    }
    // Fit the map view to the extended bound
    map.fitBounds(bounds);
}
/**
 * vacationRouteCallback function
 * This function is the callback function of the sendXMLRequestForRoute function used in the getVacationRoute function.
 * It push the route coordinates obtained from the data retrieved to the directionObject.
 * @param {Object} data the data return from the sendXMLRequestForRoute function
 */
function vacationRouteCallback(data)
{
    // Obtain the coordinates of the route and use a for loop to push the coordinates into the directionObject coordinates array
    let currentRoute = data.routes[0].geometry.coordinates;
    for (let i = 0; i < currentRoute.length; i++)
    {
        directionObject.data.geometry.coordinates.push(currentRoute[i]);
    }
}
/**
 * getVacationRoute function
 * This function will take the point of interest list in the vacation to be displayed and get the route via the sendXMLRequestForRoute function.
 * @param {Array} pointOfInterestArray the array of point of interest
 */
function getVacationRoute(pointOfInterestArray)
{
    // This for loop requests for the route with the provided pointOfInterest array
    for (let i = 0; i < pointOfInterestArray.length - 1; i++)
    {
        let startLat = pointOfInterestArray[i].coordinates.lat;
        let startLng = pointOfInterestArray[i].coordinates.lng;
        let endLat = pointOfInterestArray[i+1].coordinates.lat;
        let endLng = pointOfInterestArray[i+1].coordinates.lng;
        sendXMLRequestForRoute(startLat, startLng, endLat, endLng, vacationRouteCallback);
    }
}
/**
 * addSourceAndLayer function
 * This function runs when the map is loaded.
 * It adds the directionObject to the map source and add the layer to the map.
 */
function addSourceAndLayer()
{
    // Add the data source to the map with the routes ID
    map.addSource("routes", directionObject);
    // Add the line layer to the map
    map.addLayer(
        {
            id: "routes",
            type: "line",
            source: "routes",
            layout: 
            {
                "line-join": "round", 
                "line-cap": "round" 
            },
            paint: 
            {
                "line-color": "#888", 
                "line-width": 6 
            }
        }
    );
    console.log("Map is loaded");
}
// Event listener to add source and layer when the map loads.
map.on("load", addSourceAndLayer);