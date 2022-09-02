/*
 * File Name: mapForPlanning.js
 * Purpose: This files contains all the functions that are used for the map in the plan vacation.html page, 
 *          where the functions are called in main.js to show relevant information on the map.
 * Team: 154
 * Author: Ng Shien Ming
 * Last Modified: 14/10/2021
*/
"use strict";
// Add the map to the plan vacation page
mapboxgl.accessToken = MAPBOX_KEY;
let map = new mapboxgl.Map(
    {
        container: 'map',
        center: [101.6011, 3.0648],
        zoom: 15,
        style: 'mapbox://styles/mapbox/streets-v11'
    }
);
// Marker and popup for the starting location
let marker = new mapboxgl.Marker(
    {
        draggable: true,
        color: "#FB8564"
    }
);
let popup = new mapboxgl.Popup(
    { 
        closeOnClick: false,
        offset: 40
    }
);
// Marker and popup for the area of interest
let areaOfInterestmarker = new mapboxgl.Marker(
    {
        draggable: true,
        color: "#FCED97"
    }
);
let areaOfInterestpopup = new mapboxgl.Popup(
    { 
        closeOnClick: false,
        offset: 40
    }
);
// geojson object for displaying the route on the map
let directionObject = 
{
    type: "geojson",
    data:
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
// Zoom in and out control
map.addControl(new mapboxgl.NavigationControl());
// Get user location control
map.addControl(new mapboxgl.GeolocateControl());
/**
 * onDragEnd function
 * This function runs when the marker of the starting location is dragged.
 * It obtains the coordinates of the marker and send a reverse geocoding request to obtain the data of the location.
 */
function onDragEnd()
{
    // Use the getLngLat method to obtain the coordinates after dragging
    let lngLat = marker.getLngLat();
    let lng = lngLat.lng;
    let lat = lngLat.lat;
    // Use Reverse Geocoding with the coordinates to retrieve the information of the location where the dragging event ends
    sendWebServiceRequestForReverseGeocoding(lat,lng,"geocodingCallback");
}
/**
 * mapToLocation function
 * This function pan the map view to the starting location and set the marker and popup on the starting location.
 * @param {Number} lng longitude of the starting location
 * @param {Number} lat latitude of the starting location
 * @param {Object} marker marker of the starting location
 * @param {Object} popup popup of the starting location
 */
function mapToLocation(lng, lat, marker, popup)
{
    // Fly the map to a location with the coordinates with appropriate zooming
    map.flyTo(
        {
            center: [lng, lat],
            zoom: 15
        }
    );
    // Set the marker and popups on the location and turn on the dragend event for the marker
    marker.setLngLat([lng, lat]);
    marker.addTo(map);
    marker.setPopup(popup);
    popup.addTo(map);
    marker.on('dragend', onDragEnd);
}
/**
 * addMarkerOnClick function
 * This function track the 'click' event and display a marker on the position clicked 
 * and send a reverse geocoding request to obtain the data of the location.
 * @param {Event} onClick position where the marker is clicked
 */
function addMarkerOnClick(onClick)
{
    // Obtain the coordinates at the position clicked
    let coordinate = onClick.lngLat;
    let lng = coordinate.lng;
    let lat = coordinate.lat;
    // Set the marker on the map
    marker.setLngLat([lng, lat]);
    marker.addTo(map);
    // Use Reverse Geocoding with the coordinates to retrieve the information of the location clicked
    sendWebServiceRequestForReverseGeocoding(lat,lng,"geocodingCallback");
}
/**
 * removeMarkers function
 * This function removes the markers and popups on the map and clears the markers and popups in the marker and popup array.
 * @param {Array} markerArray array containing the markers on the map
 * @param {Array} popupArray array containing the popups on the map
 */
function removeMarkers(markerArray, popupArray)
{
    // markerArray and popupArray has the same length.
    // Loop through the array and remove the markers and popups.
    for (let i = 0; i < markerArray.length; i++)
    {
        markerArray[i].remove();
        popupArray[i].remove();
    }
    // Reset the arrays into blank arrays.
    markerArray.length = 0;
    popupArray.length = 0;
}
/**
 * showNearestPOIMarkers function
 * This function takes the name, address category and coordinates of the POI and display it on the map.
 * @param {String} poiName name of the point of interest
 * @param {String} poiAddress address of the point of interest
 * @param {Array} poiCoordinates coordinates of the point of interest
 */
function showNearestPOIMarkers(poiName, poiAddress, poiCategory, poiCoordinates)
{
    // Create new marker and popup
    let poiMarker = new mapboxgl.Marker(
        {
            color: "#45C7AF"
        }
    );
    let poiPopup = new mapboxgl.Popup(
        { 
            closeOnClick: false,
            offset: 40
        }
    );
    // Set the HTML of the popup to be displayed
    poiPopup.setHTML(`Name: ${poiName}<br>Address: ${poiAddress}<br>Type: ${poiCategory}`);
    // Set the coordinates of the marker
    poiMarker.setLngLat(poiCoordinates);
    // Add the marker to the map
    poiMarker.addTo(map);
    // Set the popup with the HTML onto the marker
    poiMarker.setPopup(poiPopup);
    // Add the popup to the map
    poiPopup.addTo(map);
    // Push the marker and popup of the 10 nearest POI into the poiMarkers and poiPopups array respectively
    poiMarkers.push(poiMarker);
    poiPopups.push(poiPopup);
}
/**
 * showAddedPOIMarkers function
 * This function shows the markers of the added POI on the map.
 */
function showAddedPOIMarkers()
{
    // Remove the shown markers and popups on the map
    removeMarkers(addedPOIMarkers, addedPOIPopups);
    // This for loop generates the markers and popups for all the added POIs
    for (let i = 1; i < pointOfInterestList.poiList.length; i++)
    {
        // Obtain the information of the POI at the current index
        let currentPOI = pointOfInterestList.poiList[i];
        let poiName = currentPOI.name;
        let poiAddress = currentPOI.address;
        let poiType = currentPOI.category;
        let poiCoordinates = currentPOI.coordinates;
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
 * showAreaOfSearchMarker function
 * This function shows the markers of the area of interest on the map.
 */
function showAreaOfSearchMarker()
{
    // Obtain the information of the area of interest from the areaOfInterest variable
    let name = areaOfInterest.name;
    let address = areaOfInterest.address;
    let lng = areaOfInterest.lng;
    let lat = areaOfInterest.lat;
    // Set the HTML of the popup of the area of interest to be displayed
    areaOfInterestpopup.setHTML(`Name: ${name}<br>Address: ${address}`);
    // Fly the map to the area of interest with the coordinates with appropriate zooming
    map.flyTo(
        {
            center: [lng, lat],
            zoom: 15
        }
    );
    // Set the coordinates of the marker
    areaOfInterestmarker.setLngLat([lng, lat]);
    // Add the marker to the map
    areaOfInterestmarker.addTo(map);
    // Set the popup with the HTML onto the marker
    areaOfInterestmarker.setPopup(areaOfInterestpopup);
    // Add the popup to the map
    areaOfInterestpopup.addTo(map);
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
    // Check that the map is loaded
    console.log("Map is loaded");
}
/**
 * generateRoute function
 * This function updates the data in the directionObject to the added map source.
 */
function generateRoute()
{
    // Get the data source with the routes ID and set the updated data
    map.getSource("routes").setData(directionObject.data);
}
// Event listener to add a marker on the position clicked.
map.on("click", addMarkerOnClick);
// Event listener to add source and layer when the map loads.
map.on("load", addSourceAndLayer);