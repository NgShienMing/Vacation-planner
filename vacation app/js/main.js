"use strict";
/**
 * File Name: main.js
 * Purpose: This file contains all the functions that are used in the plan vacation.html page for the user to plan a vacation
 *          and incorporate with the functions in map for planning.js to show relevant information on the map.
 * Team: 154
 * Author: Ng Shien Ming, Mohammed Osman Kaizer Hassan
 * Last Modified: 15/10/2021
 */
// Constant variable
const EARTH_RADIUS = 6371;
const SEDAN_RANGE = 1000;
const SUV_RANGE = 850;
const VAN_RANGE = 600;
const MINIBUS_RANGE = 450;
// Variable using classes
let vacation = new Vacation();
let startingLocation = new PointOfInterest();
let pointOfInterestList = new PointOfInterestList();
// Index and counter
let tempIndex = 0;
let poiCounter = 1;
let reorderIndex = [0,0];
let reorderRemainingRange = vacation.vehicleRange;
// Markers and popups array for ten nearest POI and added POI
let poiMarkers = [];
let poiPopups = [];
let addedPOIMarkers = [];
let addedPOIPopups = [];
// List of ten nearest POI
let generatedPOIList = [];
// Area of interest object
let areaOfInterest =
{
    name: "",
    address: "",
    lng: 0,
    lat: 0
};
// Reference the saving dialog by its Id
let saveDialog = document.getElementById("saveDialog");
// Reference the change order dialog by its Id
let orderDialog = document.getElementById("orderDialog");
/**
 * setLocation function
 * This functions sets the data of the starting location to the 
 * startingLocation variable which is a PointOfInterest class.
 * @param {Object} location starting location
 * @param {String} name name of the starting location
 * @param {String} address address of the starting location
 * @param {String} category category of the starting location
 * @param {Number} lng longitude of the starting location
 * @param {Number} lat latitude of the starting location
 */
function setLocation(location, name, address, category, lng, lat)
{
    if (location instanceof PointOfInterest)
    {
        // Set the values for the name, address, category and coordinates of the location
        location.name = name;
        location.address = address;
        location.category = category;
        location.coordinates = [lng, lat];
    }
}

/**
 * geocodingCallback function
 * This function is the callback function of the ForwardGeocoding and ReverseGeocoding used for the starting location.
 * It returns the data of the location and sets the location name into the startingLocation input field, 
 * set the data of the location to the startingLocation variable and display it on the map.
 * @param {Object} data the data return from the rwardGeocoding and ReverseGeocoding function
 */
function geocodingCallback(data)
{
    // Obtain the data of the location
    let location = data.results[0];
    let name = "";
    let type = location.components._type;
    if (location.components[type]) 
    {
        name = location.components[type];
    }
    else 
    {
        name = "Starting Location";
    }
    let address = location.formatted;
    let category = location.components._category;
    let lng = location.geometry.lng;
    let lat = location.geometry.lat;
    // Put the name of the starting location into the search starting location field
    let startingLocationRef = document.getElementById("startingLocation");
    startingLocationRef.value = name;
    // Reset the error message to empty string
    let startingLocationMsgRef = document.getElementById("nameaddressMsg");
    startingLocationMsgRef.innerText = "";
    // Set the data of the starting location
    setLocation(startingLocation, name, address, category, lng, lat);
    // Set the HTML of the popup
    popup.setHTML(`Name: ${name}<br>Address: ${address}<br>Type: ${category}`);
    // Fly the map to the starting location and set the marker and popup
    mapToLocation(lng, lat, marker, popup);
}

/**
 * processCurrentLocation function
 * This function is the callback function for the getUserCurrentLocationUsingGeolocation function.
 * The getUserCurrentLocationUsingGeolocation function will run when the get current location button is clicked.
 * Then it will run this callback function to get the data of the user's current location through reverse geocoding.
 * @param {Number} lat latitude of the user's current location
 * @param {Number} lng longitude of the user's current location
 */
function processCurrentLocation(lat,lng)
{
    if (vacation.startingLocation)
    {
        // If starting location is already added to the vacation, alert the user
        alert("Starting location is already added.");
    }
    else
    {
        // Use the coordinates to runs the sendWebServiceRequestForReverseGeocoding function to retrieve the data of the user's current location
        sendWebServiceRequestForReverseGeocoding(lat,lng,"geocodingCallback");
    }
}

/**
 * searchStartingLocation function
 * This function runs when the search starting location button is clicked.
 * It takes the user's input to search a starting location and run the sendWebServiceRequestForForwardGeocoding
 * function to retrieve the data of the searched starting location.
 */
function searchStartingLocation()
{
    //Obtain the values for the starting location of the vacation
    let startingLocationRef = document.getElementById("startingLocation");
    let startingLocationSearch = startingLocationRef.value;
    if (vacation.startingLocation)
    {
        // Alerts the user if the starting location is already added
        alert("Starting location is already added.");
    }
    else 
    {
        if (!startingLocationSearch)
        {
            // Alerts the user to enter a location name or address to the search field 
            alert("Please enter location name or address!");
            let startingLocationMsgRef = document.getElementById("nameaddressMsg");
            startingLocationMsgRef.innerText = "Please enter location name or address!";
        }
        else
        {
            // Use the name or address to run the sendWebServiceRequestForReverseGeocoding function to retrieve the data of the starting location
            sendWebServiceRequestForForwardGeocoding(startingLocationSearch, "geocodingCallback");
        }
    }
}

/**
 * confirmStartingLocation function
 * This function runs when the confirm button of the starting location is clicked.
 * It allows the user to confirm the desired starting location where a confirm pop-up appears
 * informing the user that the starting location cannot be changed after it is confirmed.
 */
function confirmStartingLocation()  
{
    if (startingLocation.address)   
    {
        if (vacation.startingLocation)
        {
            // Alerts the user if the starting location is already added
            alert("Starting location is already added.");
        }
        else
        {
            let setStartingLocation = confirm(`Confirm to select this starting location?\nYou will not be able to make changes after the starting location is added.`);
            if (setStartingLocation)
            {
                // Set the starting location into the vacation variable and add the starting location into the POI list
                vacation.startingLocation = startingLocation;
                pointOfInterestList.addPOI(startingLocation);
                // Turn off the draggable and click event
                marker.setDraggable(false);
                marker.off('dragend', onDragEnd);
                map.off('click', addMarkerOnClick);
                // Set the HTML of the popup
                popup.setHTML(`Starting location: ${startingLocation.name}<br>Address: ${startingLocation.address}<br>Type: ${startingLocation.category}`);
                // The pointOfInterest list is displayed
                displayPointOfInterestList(pointOfInterestList.poiList);
                // Inform the user that the starting location is selected and confirmed
                alert("Starting location successfully selected!");
            }
        }
    }
    else
    {
        // Alerts the user if the starting location has not been searched
        alert("Please select a starting location!");
        let startingLocationMsgRef = document.getElementById("nameaddressMsg");
        startingLocationMsgRef.innerText = "Please select a starting location!";
    }
}

/**
 * confirmVehicleType function
 * This function allows the user the confirm the selection of the vehicle type where a confirm pop-up appears
 * informing the user that the vehicle type cannot be changed after it is confirmed.
 */
function confirmVehicleType()
{
    // Retrieves the value of the vehicle type
    let vehicleTypeRef = document.getElementById("vehicleType");
    let vehicleType = vehicleTypeRef.value;
    // Initialise the vehicle range and remaining range
    let vehicleRange = 0;
    let remainingRange = 0;
    if (!vehicleType)
    {
        // Alert the user when vehicle type has not been selected
        let vehicleMsgRef = document.getElementById("vehicleTypeMsg");
        vehicleMsgRef.innerText = "Please select a vehicle type!";
        alert("Please select a vehicle type!");
    }
    else
    {
        if (vacation.vehicleType)
        {
            // Alerts the user if the vehicle type is already selected
            alert("Vehicle is already selected!");
        }
        else 
        {
            let newVehicle = confirm(`Confirm to select this vehicle type?\nYou will not be able to make changes after the vehicle type is selected.`);
            // Set the vehicle range and remaining range according to the vehicle type selected
            if (newVehicle)
            {
                if (vehicleType == "Sedan")
                {
                    vehicleRange = SEDAN_RANGE;
                    remainingRange = SEDAN_RANGE;
                }
                else if (vehicleType == "SUV")
                {
                    vehicleRange = SUV_RANGE;
                    remainingRange = SUV_RANGE;
                }
                else if (vehicleType == "Van")
                {
                    vehicleRange = VAN_RANGE;
                    remainingRange = VAN_RANGE;
                }
                else if (vehicleType == "Minibus")
                {
                    vehicleRange = MINIBUS_RANGE;
                    remainingRange = MINIBUS_RANGE;
                }
                vacation.vehicleType = vehicleType;
                vacation.vehicleRange = vehicleRange;
                vacation.remainingEndurance = vehicleRange;
                // Display the remaining range on the page
                let remainingRangeRef = document.getElementById("remainingRange");
                remainingRangeRef.innerText = `${remainingRange.toFixed(2)} km`;
                // Alerts the user that the vehicle type is selected
                alert("Vehicle successfully selected!");
            }
        }
    }
}

/**
 * displayPointOfInterestList function
 * This function displays the POIs in the list in a table format on the page
 * when a POI is added or removed.
 * @param {Array} poiArray the array of point of interest list
 */
function displayPointOfInterestList(poiArray)
{
    let pointOfInterestDisplayRef = document.getElementById("poiListDisplay");
    let output = ``;
    // Loop through the POI array to generate the table to be displayed
    for (let i = 0; i < poiArray.length; i++)
    {
        let listIndex = i + 1;
        let name = pointOfInterestList.poiList[i].name;
        // Generate output by concatenating HTML table elements
        output += `<tr>
            <td class="mdl-data-table__cell--non-numeric">${listIndex}</td>
            <td class="mdl-data-table__cell--non-numeric">${name}</td>
            <td class="mdl-data-table__cell--non-numeric">${vacation.distanceBetweenEachLeg[i].toFixed(2)}</td>
            <td class="mdl-data-table__cell--non-numeric">
                <button class="mdl-button mdl-js-button mdl-button--icon mdl-color--red-400" onclick="deletePOI(${i})">
                    <i class="material-icons">delete</i>
                </button>
            </td>
        </tr>`;
    }
    // List is displayed using innerHTML
    pointOfInterestDisplayRef.innerHTML = output;
}

/**
 * haversineDistanceFormula function
 * This function takes the coordinate of two points and 
 * calculates the distance between the two points
 * then return the distance in kilometer.
 * @param {Number} lat1 latitude of the current POI
 * @param {Number} lng1 longitude of the current POI
 * @param {Number} lat2 latitude of the next POI
 * @param {Number} lng2 longitude of the next POI
 * @returns Distance between the two points
 */
function haversineDistanceFormula(lat1, lng1, lat2, lng2)
{
    // Use the coordinates of two points to calculate the distance
    let lat1R = lat1*Math.PI/180;
    let lng1R = lng1*Math.PI/180;
    let lat2R = lat2*Math.PI/180;
    let lng2R = lng2*Math.PI/180;
    let squareOfHalfChordLength = (Math.sin((lat2R - lat1R)/2))**2 + Math.cos(lat1R)*Math.cos(lat2R)*(Math.sin((lng2R - lng1R)/2))**2;
    let angularDistance = 2*Math.atan2(Math.sqrt(squareOfHalfChordLength ),Math.sqrt(1 - squareOfHalfChordLength ));
    let distance = EARTH_RADIUS*angularDistance;
    return distance;
}

/**
 * distanceBetweenPOI function
 * This function takes the array of coordinates and
 * uses the haversineDistanceFormula function
 * to calculate the total distance between two POIs.
 * @param {Array} coordinates the coordinates of the route 
 * @returns Total distance between two POIs
 */
function distanceBetweenPOI(coordinates)
{
    // Initialize the distance between POIs as 0
    let distance = 0;
    // This for loop loops through the coordinates of the route to calculate the distance
    for (let i = 0; i < coordinates.length - 1; i++)
    {
        /*
        Obtain the coordinates of the current POI and the next following POI to the current POI 
        to calculate distance with the haversineDistanceFormula function
        */ 
        let prevLat = coordinates[i][1];
        let prevLng = coordinates[i][0];
        let nextLat = coordinates[i+1][1];
        let nextLng = coordinates[i+1][0];
        distance += haversineDistanceFormula(prevLat, prevLng, nextLat, nextLng);
    }
    return distance;
}

/**
 * remainingRangeWarning function
 * This function changes the colour of the remaining range display depending on the remaining range left of the vehicle.
 * 0 - 25% left: Red
 * 25 - 50% left: Orange
 * 50 - 75% left: Yellow
 * 75 - 100% left: Green
 * @param {Number} remainingRange the calculated remaining range
 */
function remainingRangeWarning(remainingRange)
{
    let selectedVehicleRange = vacation.vehicleRange;
    let remainingRangeRef = document.getElementById("remainingRange");
    // 0 - 25% left: Red
    if (remainingRange > 0 && remainingRange <= selectedVehicleRange/4)
    {
        remainingRangeRef.style.color = "#FF0000";
    }
    // 25 - 50% left: Orange
    else if (remainingRange > selectedVehicleRange/4 && remainingRange <= selectedVehicleRange/2)
    {
        remainingRangeRef.style.color = "#FF6700";
    }
    // 50 - 75% left: Yellow
    else if (remainingRange > selectedVehicleRange/2 && remainingRange <= 3*selectedVehicleRange/4)
    {
        remainingRangeRef.style.color = "#EBB501";
    }
    // 75 - 100% left: Green
    else if (remainingRange > 3*selectedVehicleRange/4 && remainingRange <= selectedVehicleRange)
    {
        remainingRangeRef.style.color = "#03C04A";
    }
}

/**
 * routeTotalDistance function
 * This function calculates the journey's total distance and display it on the page.
 * @param {Number} distanceBetweenTwoPOI the calculated distance between two POIs in the list
 */
function routeTotalDistance(distanceBetweenTwoPOI)
{
    let totalDistanceRef = document.getElementById("totalDistance");
    // Retrieves the value of the total distance of the vacation to calculate the next total distance when a POI is added
    let totalDistance = vacation.totalDistance;
    totalDistance += distanceBetweenTwoPOI;
    // Update the new total distance into the vacation variable
    vacation.totalDistance = totalDistance;
    // Display the total distance
    totalDistanceRef.innerText = `${totalDistance.toFixed(2)} km`;
}

/**
 * vehicleRemainingEndurance function
 * This function takes the distance between two POI and
 * calculates the remaining range of the vehicle 
 * then displays it on the page.
 * @param {Number} distanceBetweenTwoPOI the calculated distance between two POIs in the list
 */
function vehicleRemainingEndurance(distanceBetweenTwoPOI)
{
    let remainingRangeRef = document.getElementById("remainingRange");
    // Retrieve the value for the remaining range of the vehicle to calculate the next total remaining range
    let remainingRange = vacation.remainingEndurance;
    remainingRange -= distanceBetweenTwoPOI;
    // Reset the remaining range to the vehicle range when a gas station is selected
    if (pointOfInterestList.poiList[poiCounter].category == "gas station, fuel, gas")
    {
        remainingRange = vacation.vehicleRange;
        vacation.remainingEndurance = remainingRange;
        poiCounter++;
    }
    else
    {
        vacation.remainingEndurance = remainingRange;
        poiCounter++;
    }
    // Use the remaining range to show a coloured warning on the text
    remainingRangeWarning(vacation.remainingEndurance);
    remainingRangeRef.innerText = `${remainingRange.toFixed(2)} km`;
}

/**
 * checkStartingLocation function
 * This function validates if the user has added a particular starting location.
 * @returns true if a starting location is added, false if not added.
 */
function checkStartingLocation()
{
    if (vacation.startingLocation)
    {
        return true;
    }
    else 
    {
        // Runs when user has not added a starting location 
        // A pop-up will be displayed to alert the user 
        alert("Please add a starting location first."); 
        let startingLocationMsgRef = document.getElementById("nameaddressMsg");
        startingLocationMsgRef.innerText = "Please add a starting location!";
        return false;
    }
}

/**
 * checkVehicleType function
 * This function checks if the user has selected a particular vehicle type.
 * @returns true if a vehicle type is chosen, false if not chosen.
 */
function checkVehicleType()
{
    if (vacation.vehicleType)
    {
        return true;
    }
    else 
    {
        // Runs when user has not selected a vehicle yet
        // The user will be displayed with a pop-up alert 
        alert("Please select a vehicle first."); 
        let vehicleMsgRef = document.getElementById("vehicleTypeMsg");
        vehicleMsgRef.innerText = "Please select a vehicle type!";
        return false;
    }
}

/**
 * generatePOIOption function
 * This function takes the ten nearest POIs and generates the option element with each POIs.
 */
function generatePOIOption()
{
    let poiOptionsRef = document.getElementById("poiOption");
    for (let i in generatedPOIList)
    {
        let option = document.createElement("option");
        let value = document.createAttribute("value");
        let text = document.createTextNode(`${generatedPOIList[i].name}`);
        value.value = generatedPOIList[i].address;
        option.setAttributeNode(value);
        option.appendChild(text);
        poiOptionsRef.appendChild(option);
    }
}

/**
 * processPOIData function
 * This functon is the callback function of the sendXMLRequestForPlaces function.
 * It takes the data of the ten nearest POIs and show them with markers on the map,
 * fit all the ten nearest POIs to the map view and generate the options in a drop down list.
 * @param {Object} data the data return from the sendXMLRequestForPlaces function
 */
function processPOIData(data)
{
    removeMarkers(poiMarkers, poiPopups);
    let nearestPOI = data.features;
    // Initialise an empty coordinates array
    let coordinates = [];
    // Reset the generatedPOIList to an empty array
    generatedPOIList = [];
    // This for loop loops through the nearest POI retrieved and push into the generatedPOIList and show the markers
    for (let i in nearestPOI)
    {
        // Obtain the name, address, category and coordinates of the nearest POI to the current POI
        let currentPOI = nearestPOI[i];
        let poiName = currentPOI.text;
        let poiAddress = currentPOI.place_name;
        let poiCategory = currentPOI.properties.category;
        let poiCoordinates = currentPOI.geometry.coordinates;
        let poi = 
        {
            name: poiName,
            address: poiAddress,
            type: poiCategory,
            coordinates: poiCoordinates
        };
        // Push the poiCoordinates into the coordinates array
        coordinates.push(poiCoordinates);
        // Push the POI into the generatedPOIList
        generatedPOIList.push(poi);
        // Calling the showNearestPOIMarkers function to display the markers and popups of the selected POI
        showNearestPOIMarkers(poiName, poiAddress, poiCategory, poiCoordinates);
    }
    // Using the coordinates array to fit marker to map view
    fitMarkersToMapView(coordinates);
    // Generate the 10 POI Option in the select field
    generatePOIOption();
}

/**
 * generateTenNearestPOI function
 * This function takes the selected category and the coordinates of the last POI/areaOfInterest and
 * send a request to return the ten nearest POIs.
 */
function generateTenNearestPOI()
{
    if (checkStartingLocation() & checkVehicleType())
    {
        let categoryRef = document.getElementById("poiCategory");
        let selectedCategory = categoryRef.value;
        if (selectedCategory == "")
        {
            // Runs when the user has yet to select a category
            // Alert the user with a pop up and an error message under the category field
            alert("Please select a valid category!");
            let poiCategoryMsgRef = document.getElementById("poiCategoryMsg");
            poiCategoryMsgRef.innerText = "Please select a valid category!";
        }
        else
        {
            // Use the coordinates of the latest added POI to get the 10 nearest POI
            let poiArray = pointOfInterestList.poiList;
            let previousLocation = poiArray[poiArray.length - 1];
            let lng = 0;
            let lat = 0;
            if (areaOfInterest.name)
            {
                lng = areaOfInterest.lng;
                lat = areaOfInterest.lat;
            }
            else
            {
                lng = previousLocation.coordinates.lng;
                lat = previousLocation.coordinates.lat;
            }
            sendXMLRequestForPlaces(selectedCategory,lng,lat,processPOIData);
            // Output the options to the POI option field with innerHTML
            let poiOptionsRef = document.getElementById("poiOption");
            let output = `<option value=""></option>`;
            poiOptionsRef.innerHTML = output;
        }
    }
}

/**
 * areaOfInterestCallback function
 * This function is the callback function for Forward Geocoding of the searchAreaOfInterest function.
 * It takes the data from the web service and updates the areaOfInterest variable and show it with a marker and popup on the map.
 * @param {Object} data the data returned from the sendWebServiceRequestForForwardGeocoding function
 */
function areaOfInterestCallback(data)
{
    // Obtain the data of the location
    let location = data.results[0];
    let name = "";
    let type = location.components._type;
    if (location.components[type]) 
    {
        name = location.components[type];
    }
    else 
    {
        name = "Area of Interest";
    }
    //Obtain the name, address and coordinates of the area of interest 
    let address = location.formatted;
    let lng = location.geometry.lng;
    let lat = location.geometry.lat;
    // Set the value to each property into the areaOfInterest variable
    areaOfInterest.name = name;
    areaOfInterest.address = address;
    areaOfInterest.lng = lng;
    areaOfInterest.lat = lat;
    // Runs the showAreaOfSearchMarker function to view the area of interest based on the details given
    showAreaOfSearchMarker();
}

/**
 * searchAreaOfInterest function 
 * This function takes the user input to search for an area of interest and 
 * send a web service request to obtain the data of the location. 
 */
function searchAreaOfInterest()
{
    let areaRef = document.getElementById("poiSearch");
    let areaSearch = areaRef.value;
    if (!areaSearch)
    {
        // Runs when there is no location name or address entered 
        alert("Please enter location name or address!");
        let areaErrorMsgRef = document.getElementById("areaMsg");
        areaErrorMsgRef.innerText = "Please enter location name or address!";
    }
    else
    {
        // Sends a request to obtain the data of the area of interest
        sendWebServiceRequestForForwardGeocoding(areaSearch, "areaOfInterestCallback");
    }
}

/**
 * viewSelectedPOI function
 * This function runs when one of the ten nearest POIs is selected.
 * It will remove all the ten nearest POI markers, pan to the selected POI and display its marker and popup. 
 */
function viewSelectedPOI()
{
    // Obtaining the value of the poiOption
    let poiSelectionRef = document.getElementById("poiOption");
    let selectedPOI = poiSelectionRef.value;
    // This for loop loops through the generatedPOIList to find the selected POI and show the marker and popup
    for (let i = 0; i < generatedPOIList.length; i++)
    {
        let currentPOI = generatedPOIList[i];
        if (selectedPOI == currentPOI.address)
        {
            removeMarkers(poiMarkers, poiPopups);
            map.panTo(currentPOI.coordinates);
            let poiName = currentPOI.name;
            let poiAddress = currentPOI.address;
            let poiCategory = currentPOI.type;
            let poiCoordinates = currentPOI.coordinates;
            showNearestPOIMarkers(poiName, poiAddress, poiCategory, poiCoordinates);
        }
    }
}

/**
 * addingNextPOI function
 * This function is the callback function for sendXMLRequestForRoute function used in the addPOI function.
 * It checks if the route is feasible and decides if the recent added POI has to be removed or show it on the route.
 * @param {Object} data the route data returned from the XML request
 */
function addingNextPOI(data)
{
    if (data.code == 'NoRoute')
    {
        // Runs if the route is not feasible where an alert pop-up is displayed to the user
        pointOfInterestList.removePOI(pointOfInterestList.poiList.length - 1);
        alert("Point of Interest not reachable");
    }
    else
    {
        let currentRoute = data.routes[0].geometry.coordinates;
        // Calculate the distance between the previous POI and the newly added POI 
        let distanceBetweenTwoPOI = distanceBetweenPOI(currentRoute);
        let remainingRange = vacation.remainingEndurance;
        // Calculates the next remaining range using the calculated distance
        let nextRemainingRange = remainingRange - distanceBetweenTwoPOI;
        if (nextRemainingRange < 0)
        {
            // If the next remaining range is negative, alert the user that the POI cannot be added and remove the pushed POI
            pointOfInterestList.removePOI(pointOfInterestList.poiList.length - 1);
            alert("Remaining range of the vehicle is insufficient, unable add point of interest.");
            let poiRef = document.getElementById("poiSearch");
            poiRef.value = "";
        }
        else 
        {
            // Empty the area of interest search field and remove the area of interest marker and popup
            let poiRef = document.getElementById("poiSearch");
            poiRef.value = "";
            areaOfInterestmarker.remove();
            areaOfInterestpopup.remove();
            // Update the distance between each leg array in the vacation variable with the distanceBetweenTwoPOI
            vacation.distanceBetweenEachLeg = distanceBetweenTwoPOI;
            // Use a loop to push the coordinates of the current route 
            for (let i = 0; i < currentRoute.length; i++)
            {
                directionObject.data.geometry.coordinates.push(currentRoute[i]);
            }
            // Initialize an empty coordinated array
            let coordinates = [];
            // Using a loop to push through each poi into the empty coordinates array
            for (let j = 0; j < pointOfInterestList.poiList.length; j++)
            {
                let currentCoordinates = [pointOfInterestList.poiList[j].coordinates.lng, pointOfInterestList.poiList[j].coordinates.lat];
                coordinates.push(currentCoordinates);
            }
            // Fit the markers into the map view
            fitMarkersToMapView(coordinates);
            // Update the map with the newly added POI by incooperating the POI markers and removing the POI popups and rest of the POI markers
            removeMarkers(poiMarkers, poiPopups);
            showAddedPOIMarkers();
            // Calculates the total distance by taking the distance between the two POI
            routeTotalDistance(distanceBetweenTwoPOI);
            // Calculates the vechile's remaining range by taking the distance between the two POI
            vehicleRemainingEndurance(distanceBetweenTwoPOI);
            // Update the display of POI list with the newly added POI
            displayPointOfInterestList(pointOfInterestList.poiList);
            // Generate the next nearest POI with the newly added POI
            generateTenNearestPOI();
            // Generate the route on the map
            generateRoute();
            if (pointOfInterestList.poiList[pointOfInterestList.poiList.length - 1].category == "gas station, fuel, gas")
            {
                // Runs if the newly added POI is a gas station, where this will re-fuel the vehicle and the remaining range is re-set
                vacation.remainingEndurance = vacation.vehicleRange;
                remainingRangeWarning(vacation.remainingEndurance);
                let remainingRangeRef = document.getElementById("remainingRange");
                remainingRangeRef.innerText = `${vacation.remainingEndurance.toFixed(2)} km`;
            }
        }
    }
}

/**
 * nextPOIDirections function
 * This function takes the most recent added POI longitude and latitude and
 * send request for the route from the last POI to the recently added POI.
 * @param {Number} addedPOILng 
 * @param {Number} addedPOILat 
 */
function nextPOIDirections(addedPOILng, addedPOILat)
{
    // Obtain the latitude and longtitude of the previously added POI
    let lastPOI = pointOfInterestList.poiList[pointOfInterestList.poiList.length - 2];
    let lastPOILng = lastPOI.coordinates.lng;
    let lastPOILat = lastPOI.coordinates.lat;
    // Send a request for a route from the previous POI to the recently added POI
    sendXMLRequestForRoute(lastPOILat, lastPOILng, addedPOILat, addedPOILng, addingNextPOI);
}

/**
 * addPOI function
 * This function runs when the add button is clicked.
 * It adds a chosen POI to the POI list.
 */
function addPOI()
{
    let poiSelectionRef = document.getElementById("poiOption");
    let selectedPOI = poiSelectionRef.value;
    let status = true;
    // For loop to loop through the entire POI list
    for (let i = 0; i <  pointOfInterestList.poiList.length; i++)
    {
        if (pointOfInterestList.poiList[i].address == selectedPOI)
        {
            // Runs if the newly added POI is already added to the route
            // Results in displaying an alert pop-up to the user
            alert("This point of interest is already added to the route, please select another one.");
            let poiSelectionErrorRef = document.getElementById("poiOptionMsg");
            poiSelectionErrorRef.innerText = "This point of interest is already added.";
            status = false;
        }
    }
    // If the newly added POI is valid
    if (status)
    {
        // This for loop loops to through the POI list 
        for (let j = 0; j < generatedPOIList.length; j++)
        {
            let currentPOI = generatedPOIList[j];
            if (selectedPOI == currentPOI.address)
            {
                // Obtain the name, address, category and coordinates of the added POI
                let name = currentPOI.name;
                let address = currentPOI.address;
                let category = currentPOI.type;
                let lng = currentPOI.coordinates[0];
                let lat = currentPOI.coordinates[1];
                // Construct the POI with the PointOfInterest class with the properties
                let newPointOfInterest = new PointOfInterest(name, address, category, lng, lat);
                // Add the POI into the list and obtain the direction to the next POI
                pointOfInterestList.addPOI(newPointOfInterest);
                nextPOIDirections(lng, lat);
            }
        }
    }
}

/**
 * deletedDirectionsCallback function
 * This function is a callback function 
 * @param {Object} data the route data returned from the XML request
 */
function deletedDirectionsCallback(data)
{   
    let currentRoute = data.routes[0].geometry.coordinates;
    // Pushes the coordinates of the current route into the coordinates array of the directionObject
    for (let i = 0; i < currentRoute.length; i++)
    {
        directionObject.data.geometry.coordinates.push(currentRoute[i]);
    }
    // Calculates the distance of the current route and update the distanceBetweenEachLeg array
    let distanceBetweenTwoPOI = distanceBetweenPOI(currentRoute);
    vacation.distanceBetweenEachLeg = distanceBetweenTwoPOI;
    // Calculates the total distance of the route and remaining range with the distance between the two POIs
    routeTotalDistance(distanceBetweenTwoPOI);
    vehicleRemainingEndurance(distanceBetweenTwoPOI);
    // Display the point of interest list
    displayPointOfInterestList(vacation.distanceBetweenEachLeg);
    // Generates the route
    generateRoute();   
}

/**
 * detDeletedDrivingDirections function
 * This function regenerates all the display on the page and send a request for the route without the deleted POI 
 */
function getDeletedDrivingDirections()
{
    directionObject.data.geometry.coordinates.length = 0;
    vacation.totalDistance = 0;
    vacation.remainingEndurance = vacation.vehicleRange;
    vacation.distanceBetweenEachLeg.length = 1;
    poiCounter = 1;
    // Reset everything only the starting location is in the point of interest list 
    if (pointOfInterestList.poiList.length == 1)
    {
        // Create a reference and display the initial total distance and remaining range
        let totalDistanceRef = document.getElementById("totalDistance");
        let remainingRangeRef = document.getElementById("remainingRange");
        totalDistanceRef.innerText = `${vacation.totalDistance.toFixed(2)} km`;
        remainingRangeRef.innerText = `${vacation.remainingEndurance.toFixed(2)} km`;
        // Update the status of the remaining range and the point of interest list display
        remainingRangeWarning(vacation.remainingEndurance);
        displayPointOfInterestList(pointOfInterestList.poiList);
        generateRoute();
    }
    for (let i = 0; i < pointOfInterestList.poiList.length - 1; i++)
    {
        // Obtain the starting coordinates' latitude and longitude and ending coordinates' latitude and longitude
        let startLat = pointOfInterestList.poiList[i].coordinates.lat;
        let startLng = pointOfInterestList.poiList[i].coordinates.lng;
        let endLat = pointOfInterestList.poiList[i+1].coordinates.lat;
        let endLng = pointOfInterestList.poiList[i+1].coordinates.lng;
        // Send a request for a route from the starting coordinates to the ending coordinates
        sendXMLRequestForRoute(startLat, startLng, endLat, endLng, deletedDirectionsCallback);
    }
}

/**
 * deleteGasRemainingRange function
 * This function check if the road is feasible when a gas station is deleted to decide whether the gas station can be deleted.
 * @param {Number} poiIndex the index of the deleted gas station
 * @param {Number} distance the distance from the POI just before the gas station to the POI just after the gas station
 */
function deleteGasRemainingRange(poiIndex, distance)
{
    // Finding the path from previous gas station to the next gas station
    /* 
    Initialise the index 
    firstPoiIndex is always 0
    Assume that there is no previous gas station, hence prevGasStationIndex = 0
    Assume that there is no next gas station, hence nextGasStationIndex = Number of POIs - 1;
    */
    let firstPoiIndex = 0;
    let prevGasStationIndex = 0;
    let nextGasStationIndex = pointOfInterestList.poiList.length - 1;
    // Initialise two POI array for later use
    let tempPoiArray = new PointOfInterestList();
    let checkingDistanceList = new PointOfInterestList();
    // Remaining range from the previous gas station is the vehicle range
    let remainingRange = vacation.vehicleRange; 
    // This for loop loops the index backwards and find the previous gas station added
    for (let i = poiIndex - 1; i > firstPoiIndex; i--) 
    {
        let currentPOI = pointOfInterestList.poiList[i];
        let category = currentPOI.category;
        if (category == "gas station, fuel, gas")
        {
            prevGasStationIndex = i;
        }
    }
    // This for loops loop the index to the end of the pointOfInterestList to find the next gas station added
    for (let j = poiIndex + 1; j < pointOfInterestList.poiList.length; j++) 
    {
        let currentPOI = pointOfInterestList.poiList[j];
        let category = currentPOI.category;
        if (category == "gas station, fuel, gas")
        {
            nextGasStationIndex = j;
        }
    }
    // Push the current POI List into a temporary array
    for (let k = 0; k < pointOfInterestList.poiList.length; k++) 
    {
        tempPoiArray.addPOI(pointOfInterestList.poiList[k]);
    }
    // Remove the gas station that is deleted by the user
    tempPoiArray.removePOI(poiIndex); 
    // Push the list into a checking array from the previous gas station to the next gas staton
    for (let l = prevGasStationIndex; l < nextGasStationIndex; l++) 
    {
        checkingDistanceList.addPOI(tempPoiArray.poiList[l]);
    }
    // Subtracting with the distance of each leg stored
    for (let m = prevGasStationIndex + 1; m < nextGasStationIndex; m++) 
    {
        if (m < poiIndex)
        {
            // Runs if the POI is before the deleted POI
            remainingRange -= vacation.distanceBetweenEachLeg[m];
        }
        else if (m == poiIndex)
        {
            // Runs if the POI is at the deleted POI
            remainingRange -= distance;
        }
        else if (m > poiIndex)
        {
            // Runs if the POI is after the deleted POI
            remainingRange -= vacation.distanceBetweenEachLeg[m + 1];
        }
    }
    /* 
    If the calculated remaining range is negative, alert the user that the route is not feasible
    else remove the gas station and get the driving direction for the updated pointOfInterestList
    */
    if (remainingRange < 0)
    {
        alert("Deleting this gas station will make the road to be not feasible, unable to delete this gas station.");
    }
    else
    {
        //Using removePOI function to remove poiIndex from the pointOfInterestList 
        pointOfInterestList.removePOI(poiIndex);
        getDeletedDrivingDirections();
    }
}

/**
 * deleteGasStationCallback function
 * This function is the callback function for sendXMLRequestForRoute 
 * used in the deletePOI function if the deleted POI is a gas station on the route.
 * It calculates the distance from the POI just before the gas station to the 
 * POI just after the gas station and pass it as a parameter to the deleteGasRemainingRange function.
 * @param {Object} data the route data returned from the XML request 
 */
function deleteGasStationCallback(data)
{
    // Obtain the current route coordinates, calculate the total distance with the deleted gas station and check the remaining range
    let currentRoute = data.routes[0].geometry.coordinates;
    let tempDistance = distanceBetweenPOI(currentRoute);
    deleteGasRemainingRange(tempIndex, tempDistance);
}

/**
 * deletePOI function
 * This function runs when the delete button for the POI is clicked.
 * It takes the poiIndex and deletes the respective POI from the POI list and from the map and get the driving direction without the deleted POI.
 * @param {Number} poiIndex the index of the deleted POI
 */
function deletePOI(poiIndex)
{
    if (poiIndex == 0)
    {
        // Runs if the user attempts to delete the starting location and an alert pop-up is displayed to the user
        alert("You cannot delete the starting location!");
    }
    else if (pointOfInterestList.poiList[poiIndex].category == "gas station, fuel, gas")
    {
        if (poiIndex == pointOfInterestList.poiList.length - 1) // Works only if the last poi is the only gas station
        {
            // Removes the respective POI at the index from the POI list and updates the map
            pointOfInterestList.removePOI(poiIndex);
            showAddedPOIMarkers();
            getDeletedDrivingDirections();
        }
        else
        {
            // Stored the poiIndex in a tempIndex for later use
            tempIndex = poiIndex;
            // Getting the distance from the poibeforegasstation to the poiaftergasstation for later use
            let poiJustBeforeGasStation = pointOfInterestList.poiList[poiIndex - 1];
            let poiJustAfterGasStation = pointOfInterestList.poiList[poiIndex + 1];
            let startLat = poiJustBeforeGasStation.coordinates.lat;
            let startLng = poiJustBeforeGasStation.coordinates.lng;
            let endLat = poiJustAfterGasStation.coordinates.lat;
            let endLng = poiJustAfterGasStation.coordinates.lng;
            sendXMLRequestForRoute(startLat, startLng, endLat, endLng, deleteGasStationCallback); 
        }
    }
    else
    {
        // Removes the POI and updates the map
        pointOfInterestList.removePOI(poiIndex);
        removeMarkers(poiMarkers, poiPopups);
        // Using the showAddedPOIMarkers function to display the marker of each POI
        showAddedPOIMarkers();
        // Initialize an empty coordinated array
        let coordinates = [];
        // Using a loop to push through each poi into the empty coordinates array
        for (let i = 0; i < pointOfInterestList.poiList.length; i++)
        {
            let currentCoordinates = [pointOfInterestList.poiList[i].coordinates.lng, pointOfInterestList.poiList[i].coordinates.lat];
            coordinates.push(currentCoordinates);
        }
        // Fit the markers into the map view
        if (pointOfInterestList.poiList.length != 1)
        {
            fitMarkersToMapView(coordinates);
        }
        else 
        {
            map.flyTo(
                {
                    center: pointOfInterestList.poiList[pointOfInterestList.poiList.length - 1].coordinates,
                    zoom: 15
                }
            );
        }
        getDeletedDrivingDirections();
    }
}

/**
 * changeOrder function
 * This function runs when the change order button is clicked.
 * It takes the point of interest in the list and generated the option drop down list 
 * then output to two select field in the reorder pop out dialog for the user to swap order.
 */
function changeOrder()
{
    // Initialise the two index in the reorderIndex array to 0
    reorderIndex[0] = 0;
    reorderIndex[1] = 0;
    // Create a reference for the two poi to change order
    let order1Ref = document.getElementById("order1");
    let order2Ref = document.getElementById("order2");
    // Generate the option drop down list with the added points of interest
    let output = `<option value=""></option>`;
    for (let i = 1; i < pointOfInterestList.poiList.length; i++)
    {
        let currentPOI = pointOfInterestList.poiList[i];
        output += `<option value="${currentPOI.address}">${currentPOI.name}</option>`;
    }
    // Output the option using innerHTML and show the dialog
    order1Ref.innerHTML = output;
    order2Ref.innerHTML = output;
    orderDialog.showModal();
}

/**
 * reorderPOI function
 * This function changes the order of the two selected POI if the remaining range after changing the order of the two POI is more then 0.
 * @param {Number} firstPOIIndex 
 * @param {Number} secondPOIIndex 
 */
function reorderPOI(firstPOIIndex, secondPOIIndex) 
{
    if (reorderRemainingRange < 0)
    {
        // Runs if changing the order of the POIs results in the remaining range < 0, where the user encounters an alert pop-up
        alert("Changing the order of these POIs will make the route to be not feasible, unable to change order.");
    }
    else
    {
        // Swap the two selected POI
        let tempPOI = pointOfInterestList.poiList[firstPOIIndex];
        pointOfInterestList.poiList[firstPOIIndex] = pointOfInterestList.poiList[secondPOIIndex];
        pointOfInterestList.poiList[secondPOIIndex] = tempPOI;
        // Re-generate the display on the map with the new order of POI and close the dialog
        getDeletedDrivingDirections();
        orderDialog.close();
    }
}

/**
 * reorderDirectionsCallback function
 * This function is the callback function of the sendXMLRequestForRoute function used in the confirmChangeOrder function.
 * It takes the coordinates in the data returned to calculate the distance and remaining range
 * then runs the reorderPOI function when the end of the POI list is reached.
 * @param {Object} data 
 */
function reorderDirectionsCallback(data)
{
    poiCounter++;
    let coordinates = data.routes[0].geometry.coordinates;
    // Calculate the distance between the coordinates of the two POI
    let distanceBetweenTwoPOI = distanceBetweenPOI(coordinates);
    // Update the remaining range of the vehicle
    reorderRemainingRange -= distanceBetweenTwoPOI;
    if (poiCounter == pointOfInterestList.poiList.length)
    {
        if (reorderRemainingRange > 0)
        {
            // Runs the reorder POI function with the new order of the POI list
            reorderPOI(reorderIndex[0], reorderIndex[1]);
        }
    }
}

/**
 * confirmChangeOrder function
 * This function runs when the confirm button in the change order dialog is clicked.
 * It changes the order of the two selected POI in a temporary array for later checking.
 */
function confirmChangeOrder()
{
    // Create a reference for the two poi to change order and retrieve the value of the two POIs
    let order1Ref = document.getElementById("order1");
    let order2Ref = document.getElementById("order2");
    let firstPOI = order1Ref.value;
    let secondPOI = order2Ref.value;
    // Initialise the two POI index to 0
    let firstPOIIndex = 0;
    let secondPOIIndex = 0;
    // Assume the order can be changed
    let allowChangeOrder = true;
    let tempPoiArray = new PointOfInterestList();
    if (firstPOI == secondPOI)
    {
        // Runs if the user attempts to change the order of the same POI, which thereby displays an alert pop-up
        alert('You cannot change the order of two same point of interest!');
    }
    for (let i = 0; i < pointOfInterestList.poiList.length; i++)
    {
        let currentPOI = pointOfInterestList.poiList[i];
        if (firstPOI == currentPOI.address)
        {
            firstPOIIndex = i;
            if (currentPOI.category == "gas station, fuel, gas")
            {
                // Runs if the POI to be swapped with is a gas station which makes the route not feasible, hence alerting the user with an alert pop-up
                alert("Changing the order of the gas station will make the routeto be not feasible, unable to change order.");
                allowChangeOrder = false;
            }
        }
        else if (secondPOI == currentPOI.address)
        {
            secondPOIIndex = i;
            if (currentPOI.category == "gas station, fuel, gas")
            {
                // Runs if the POI to be swapped with is a gas station which makes the route not feasible, hence alerting the user with an alert pop-up
                alert("Changing the order of the gas station will make the route to be not feasible, unable to change order.");
                allowChangeOrder = false;
            }
        }
    }
    if (allowChangeOrder)
    {
        reorderIndex[0] = firstPOIIndex;
        reorderIndex[1] = secondPOIIndex;
        // Loop through the POI list and Push the current POI List into a temporary array
        for (let j = 0; j < pointOfInterestList.poiList.length; j++) 
        {
            tempPoiArray.addPOI(pointOfInterestList.poiList[j]);
        }
        // Swap the two POIs
        let tempPOI = tempPoiArray.poiList[firstPOIIndex];
        tempPoiArray.poiList[firstPOIIndex] = tempPoiArray.poiList[secondPOIIndex];
        tempPoiArray.poiList[secondPOIIndex] = tempPOI;
        // Update the remaining range and set it equal to the vehicle's range
        reorderRemainingRange = vacation.vehicleRange;
        poiCounter = 1;
        for (let k = 0; k < tempPoiArray.poiList.length - 1; k++)
        {
            // Set and retrieve the coordinates of the starting latitude, longitude and ending latitude, longitude
            let startLat = tempPoiArray.poiList[k].coordinates.lat;
            let startLng = tempPoiArray.poiList[k].coordinates.lng;
            let endLat = tempPoiArray.poiList[k+1].coordinates.lat;
            let endLng = tempPoiArray.poiList[k+1].coordinates.lng;
            // Send a request for the new route
            sendXMLRequestForRoute(startLat, startLng, endLat, endLng, reorderDirectionsCallback);
        }
    }
    orderDialog.close();
}

/**
 * cancelChangeOrder function
 * This function closes the change order dialog when the cancel button in the change order dialog is clicked.
 */
function cancelChangeOrder()
{
    orderDialog.close();
}

/**
 * checkDate function
 * This function checks if the chosen date is valid.
 * @param {Number} inputDate the date input by the user
 * @return true if the inputDate is not in the past, false if otherwise
 */
function checkDate(inputDate)
{
    let today = new Date();
    if (today > inputDate)
    {
        // Runs if the selected date is in the past
        return false;
    }
    else if (today < inputDate)
    {
        // Runs if the selected date is in the future
        return true;
    }
}

/**
 * saveVacation function
 * This function runs when the save button is clicked
 * It checks if the user has chosen a starting location, vehicle type and if the POI list contains POI.
 * If the starting location or vehicle type or point of interest list is empty, it will alert the user.
 */
function saveVacation()
{
    if (vacation.startingLocation == "" || vacation.vehicleType == "" || pointOfInterestList.poiList.length == 1)
    {
        // Runs if the input fields for starting location and vehicle type is empty. Also, if the user hasn't added any POI
        // Thus, the user is alerted with an alert popup
        alert("Please plan your vacation first!");
    }
    else
    {
        saveDialog.showModal();
    }
}

/**
 * cancelVacation function
 * This function runs when the cancel button is clicked
 * It shows a confirm pop-up to confirm if the user wants to cancel the planned vacation.
 */
function cancelVacation()
{
    let confirmCancelVacation = confirm("Confirm to cancel vacation?\nAll data will be erased once u confirm to cancel.");
    if (confirmCancelVacation)
    {
        // Once the user cancels the planned vacation, the user is directed back to the main page where the input fields are reset
        window.location = "planVacation.html";
    }
    else
    {
        saveDialog.close();
    }
}

/**
 * confirmSaveVacation function
 * This function runs when the confirm button in the vacation saving dialog is clicked.
 * It allows the user to confirm the saving of the planned vacation 
 * where the vacation will be updated to the vacation list and saved to the local storage.
 * Summary of the vacation will then be displayed to the user.
 */
function confirmSaveVacation()
{
    // Retrieve the value for the Name of the planned vacation and it's respective starting date
    let vacationNameRef = document.getElementById("vacationName");
    let vacationDateRef = document.getElementById("vacationDate");
    let vacationName = vacationNameRef.value;
    let vacationDate = new Date(vacationDateRef.value);
    if (vacationName == "" || vacationDateRef.value == "")
    {
        // Runs if the user hasn't entered a name nor chosen a starting date for the vacation
        // Hence, user encounters an alert pop-up
        alert("Please enter a vacation name and select the vacation date!");
    }
    else
    {
        if (checkDate(vacationDate))
        {
            // Displays the summary of the planned vacation using HTML elements 
            let vacationSummary = 
            `Are you sure you want to plan this vacation?
            Vacation Name: ${vacationName}
            Vacation Date: ${vacationDate.toDateString()}
            Starting Location: ${startingLocation.name}
            Total Distance: ${vacation.totalDistance.toFixed(2)} km
            Number of Stops: ${pointOfInterestList.poiList.length - 1}`;
            let confirmSave = confirm(vacationSummary);
            if (confirmSave)
            {
                // If the user clicks on the confirm button, the respective details gets saved to the local storage
                vacation.vacationName = vacationName;
                vacation.startingDate = vacationDate;
                vacation.pointOfInterestList = pointOfInterestList;
                vacation.numberOfStops = pointOfInterestList.poiList.length - 1;
                // Adds the planned vacation to the user's vacation list
                vacationList.addVacation(vacation);
                localStorage.setItem(VACATION_INDEX_KEY, vacationList.vacationList.length - 1);
                updateLSData(VACATION_LIST_KEY, vacationList);
                saveDialog.close();
                // User gets directed to the detailed information page, where the user can view the details of the planned vacation
                window.location = "detailedInformation.html";
            }
        }
        else
        {
            // Runs if user has chosen a date in the past
            alert("You cannot plan a vacation in the past!\nPlease select another date!");
        }
    }
}

/**
 * cancelSaveVacation function
 * This function runs when the cancel button in the vacation saving dialog is clicked.
 * It closes the vacation saving dialog.
 */
function cancelSaveVacation()
{
    saveDialog.close();
}