"use strict";
/**
 * File Name: detailedInformation.js
 * Purpose: This file is used to display the selected planned vacation on the detailed information.html page, 
 *          which also incorporates with the map for detailed display.js to show relevant information on the map.
 * Author: Ng Shien Ming, Mohammed Osman Kaizer Hassan
 * Team: 154
 * Last Modified: 11/10/2021
 */

// Retrieve the respective vacation with the vacation index stored in the local storage
let vacationIndex = localStorage.getItem(VACATION_INDEX_KEY);
/**
 * displayVacation function
 * This function retrieves detailed information of the selected vacation and displays it to the user
 * @param {number} vacationIndex index of the vacation to be displayed
 */
function displayVacation(vacationIndex)
{
    // Create a reference to all the output fields with the given id
    let vacationNameRef = document.getElementById("vacationName");
    let startingDateRef = document.getElementById("vacationDate");
    let startingLocationRef = document.getElementById("startingLocation");
    let vehicleTypeRef = document.getElementById("vehicleType");
    let numberOfStopsRef = document.getElementById("numberOfStops");
    let totalDistanceRef = document.getElementById("totalDistance");
    let pointOfInterestListRef = document.getElementById("poiListDisplay");

    // Obtain values for each property and store it in different variables
    let vacation = vacationList.vacationList[vacationIndex];
    let vacationName = vacation.vacationName;
    let startingDate = new Date(vacation.startingDate);
    let startingLocation = vacation.startingLocation;
    let vehicleType = vacation.vehicleType;
    let vehicleRange = vacation.vehicleRange;
    let numberOfStops = vacation.numberOfStops;
    let totalDistance = vacation.totalDistance;
    let pointOfInterestList = vacation.pointOfInterestList;

    // Output the variables to the page with innerText to it's related output field
    vacationNameRef.innerText = vacationName;
    startingDateRef.innerHTML = startingDate.toDateString();
    startingLocationRef.innerText = startingLocation.name;
    vehicleTypeRef.innerText = `${vehicleType}: ${vehicleRange} km`;
    numberOfStopsRef.innerText = numberOfStops;
    totalDistanceRef.innerText = `${totalDistance.toFixed(2)}`;

    // Using a for loop, loop through every point of interest and generate an ordered list of POIs
    let output = ``;
    for (let i = 0; i < pointOfInterestList.poiList.length; i++)
    {
        let listIndex = i + 1;
        let currentPOI = pointOfInterestList.poiList[i];
        let name = currentPOI.name;
        output += 
        // Concatenate with HTML elements
        `<tr>
            <td class="mdl-data-table__cell--non-numeric">${listIndex}</td>
            <td class="mdl-data-table__cell--non-numeric">${name}</td>
            <td class="mdl-data-table__cell--non-numeric">${vacation.distanceBetweenEachLeg[i].toFixed(2)}</td>
        </tr>`;
    }
    // Output the list to the reference container with innerHTML
    pointOfInterestListRef.innerHTML = output;

    // Initialise an empty coordinates array
    let coordinates = [];
    // Use a for loop to push the coordinates of each poi into the empty coordinates array
    for (let j = 0; j < pointOfInterestList.poiList.length; j++)
    {
        let currentCoordinates = [pointOfInterestList.poiList[j].coordinates.lng, pointOfInterestList.poiList[j].coordinates.lat];
        coordinates.push(currentCoordinates);
    }
    // Use the coordinates array to fit marker to map view
    fitMarkersToMapView(coordinates);
    // Calling the showAddedPOIMarkers function to display the markers of each poi on the map
    showAddedPOIMarkers(vacationList.vacationList[vacationIndex].pointOfInterestList.poiList);
    // Calling the getVacationRoute function to get the route of the vacation
    getVacationRoute(vacationList.vacationList[vacationIndex].pointOfInterestList.poiList);
}
// Calling the displayVacation function to display the details
displayVacation(vacationIndex);