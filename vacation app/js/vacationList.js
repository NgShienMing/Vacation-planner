"use strict";
/**
 * File Name: vacationList.js
 * Purpose: This file contains the functions that is used to display all the user's planned vacations as a sorted list.
 *          It also contains the functions for the user to remove a vacation or view the details of a selected vacation by clicking on the respective button.
 * Author: Ng Shien Ming, Mohammed Osman Kaizer Hassan
 * Team: 154
 * Last Modified: 11/10/2021
 */

/**
 * sortVacation function
 * Using 'selection sort', method this functions sorts the vacation array based on the starting date
 * @param {Array} vacationArray the array of the vacation list
 * @returns Sorted vacation array 
 */ 
function sortVacation(vacationArray)
{
    /* 
    1. loop over the entire array
    Move through the list selecting the latest date from
    remaining elements. Everything before index i will be
    sorted.
    */ 
    for (let i = 0; i < vacationArray.length - 1; i++)
    {
        /*
        2. Find index of latest date between i and last item
        latestDateIndex is the index of the most recent date we've seen in remaining elements.
        */
        let latestDateIndex = i;
        // For each remaining element beyond i
        for (let j = i + 1; j < vacationArray.length; j++)
        {
            // See if this date is more recent than the date at the latestDateIndex
            if (vacationArray[j].startingDate > vacationArray[latestDateIndex].startingDate)
            {
                // If it is, make this the new latestDateIndex.
                latestDateIndex = j;
            }
        }
        /*
        3. If the index of the latestDateIndex isn't i, swap vacation positions
        If the lowest value was not already at index i
        */
        if (latestDateIndex !== i)
        {
            // Swap elements to put the most recent date at index i
            let temporary = vacationArray[i];
            vacationArray[i] = vacationArray[latestDateIndex];
            vacationArray[latestDateIndex] = temporary;
        }
        // Everything up to index i is now sorted, increment i.
    }
    return vacationArray;
}

/**
 * displayVacationList function
 * This function displays the sorted vacation list on the page
 */
function displayVacationList()
{
    let vacationListDisplayRef = document.getElementById("vacationList");
    sortVacation(vacationList.vacationList);
    let output = ``;
    for (let i = 0; i < vacationList.vacationList.length; i++)
    {
        let currentVacation = vacationList.vacationList[i];
        let vacationName = currentVacation.vacationName;
        let vacationDate = new Date(currentVacation.startingDate).toDateString();
        let startingLocation = currentVacation.startingLocation.name;
        let totalDistance = currentVacation.totalDistance.toFixed(2);
        let vehicleType = currentVacation.vehicleType;
        let numberOfStops = currentVacation.numberOfStops;
        // Generate output by concatenating html table elements
        output += 
        `<tr>
            <td class="mdl-data-table__cell--non-numeric">
                <span>Vacation Name: ${vacationName}</span>
                <br>
                <span>Starting Date: ${vacationDate}</span>
                <br>
                <span>Starting Location: ${startingLocation}</span>
            </td>
            <td class="mdl-data-table__cell--non-numeric">
                <span>Total Distance: ${totalDistance}</span>
                <br>
                <span>Vehicle Type: ${vehicleType}</span>
                <br>
                <span>Number of Stops: ${numberOfStops}</span>
            </td>
            <td>
                <!-- Button to remove vacation or view details -->
                <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-color--red-400 button" onclick="removeVacation(${i})">Remove</button>
                <br>
                <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent button" onclick="viewVacationDetails(${i})">Details</button>
            </td>
        </tr>`;
    }
    // Output is displayed using innerHTML
    vacationListDisplayRef.innerHTML = output;
    // Update the sorted vacation list into the local storage
    updateLSData(VACATION_LIST_KEY, vacationList);
}

/**
 * removeVacation function
 * This function removes a specifc vacation from the vacation list
 * @param {number} vacationIndex index of the vacation to be removed
 */
function removeVacation(vacationIndex)
{
    // Confirm if the user wants to remove the selected vacation
    let confirmRemove = confirm(`Are you sure you want to remove the ${vacationList.vacationList[vacationIndex].vacationName} vacation?`);
    {
        if (confirmRemove)
        {
            // Runs if the user confirms that he wants to remove the selected vacation from the list
            vacationList.removeVacation(vacationIndex);
            displayVacationList();
        }
    }
}

/**
 * viewVacationDetails function
 * This function retrieves details  of the selected vacation, from the local storage
 * @param {number} vacationIndex index of the vacation to be viewed
 */
function viewVacationDetails(vacationIndex)
{
    localStorage.setItem(VACATION_INDEX_KEY, vacationIndex);
    window.location = "detailedInformation.html";
}
// Calling the displayVacationList function to display the list on the page
displayVacationList();