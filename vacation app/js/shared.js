/*
 * File Name: shared.js
 * Purpose: This file contains 4 classes, which are Vacation, PointOfInterest, PointOfInterestList and VacationList class
 *          that will be used globally.
 * Team: 154
 * Author: Ng Shien Ming, Mohammed Osman Kaizer Hassan, Eldon Tiong Ing Hong, Nareesh Kumar Balakrishnan
 * Last Modified: 11/10/2021
*/
"use strict";
// Vacation class
class Vacation
{
    // Constructor
    constructor(vacationName="", startingDate="", startingLocation="", vehicleType="", vehicleRange=0, totalDistance=0, numberOfStops=0)
    {
        this._vacationName = vacationName;
        this._startingDate = startingDate;
        this._startingLocation = startingLocation;
        this._vehicleType = vehicleType;
        this._vehicleRange = vehicleRange;
        this._remainingEndurance = vehicleRange;
        this._pointOfInterestList = {};
        this._totalDistance = totalDistance;
        this._distanceBetweenEachLeg = [0];
        this._numberOfStops = numberOfStops;
    }
    // Accessors
    get vacationName()
    {
        return this._vacationName;
    }
    get startingDate()
    {
        return this._startingDate;
    }
    get startingLocation()
    {
        return this._startingLocation;
    }
    get vehicleType()
    {
        return this._vehicleType;
    }
    get vehicleRange()
    {
        return this._vehicleRange;
    }
    get remainingEndurance()
    {
        return this._remainingEndurance;
    }
    get pointOfInterestList()
    {
        return this._pointOfInterestList;
    }
    get totalDistance()
    {
        return this._totalDistance;
    }
    get distanceBetweenEachLeg()
    {
        return this._distanceBetweenEachLeg;
    }
    get numberOfStops()
    {
        return this._numberOfStops;
    }
    // Mutators
    set vacationName(newName)
    {
        this._vacationName = newName;
    }
    set startingDate(newDate)
    {
        this._startingDate = newDate;
    }
    set startingLocation(newStartingLocation)
    {
        if (newStartingLocation instanceof PointOfInterest)
        {
            this._startingLocation = newStartingLocation;
        }
    }
    set vehicleType(newVehicleType)
    {
        this._vehicleType = newVehicleType;
    }
    set vehicleRange(newVehicleRange)
    {
        this._vehicleRange = newVehicleRange;
    }
    set remainingEndurance(newRemainingEndurance)
    {
        this._remainingEndurance = newRemainingEndurance;
    }
    set pointOfInterestList(newPointOfInterestList)
    {
        if (newPointOfInterestList instanceof PointOfInterestList)
        {
            this._pointOfInterestList = newPointOfInterestList;
        }
    }
    set totalDistance(newTotalDistance)
    {
        this._totalDistance = newTotalDistance;
    }
    set distanceBetweenEachLeg(newDistanceBetweenEachLeg)
    {
        this._distanceBetweenEachLeg.push(newDistanceBetweenEachLeg);
    }
    set numberOfStops(newNumberOfStops)
    {
        this._numberOfStops = newNumberOfStops;
    }
    // Method
    /**
     * fromData method
     * This method restore each of the vacation in the vacation list
     * stored in the local storage to the Vacation class instance.
     * @param {Object} data 
     */
    fromData(data)
    {
        this._vacationName = data._vacationName;
        this._startingDate = data._startingDate;

        let startingLocation = new PointOfInterest();
        startingLocation.fromData(data._startingLocation);
        this._startingLocation = startingLocation;

        this._vehicleType = data._vehicleType;
        this._vehicleRange = data._vehicleRange;

        let pointOfInterestList = new PointOfInterestList();
        pointOfInterestList.fromData(data._pointOfInterestList);
        this._pointOfInterestList = pointOfInterestList;

        this._totalDistance = data._totalDistance;
        this._distanceBetweenEachLeg = [];
        for (let i = 0; i < data._distanceBetweenEachLeg.length; i++)
        {
            this._distanceBetweenEachLeg.push(data._distanceBetweenEachLeg[i]);
        }

        this._numberOfStops = data._numberOfStops;
    }
}
// PointOfInterest class
class PointOfInterest
{
    // Constructor
    constructor(name = "", address = "", category = "", lng = 0, lat = 0)
    {
        this._name = name;
        this._address = address;
        this._category = category;
        this._coordinates = {
            lng: lng,
            lat: lat
        };
    }
    // Accessor 
    get name()
    {
        return this._name;
    }
    get address()
    {
        return this._address;
    }
    get category()
    {
        return this._category;
    }
    get coordinates()
    {
        let lng = this._coordinates.lng;
        let lat = this._coordinates.lat;
        let coordinates = {
            lng: lng,
            lat: lat
        };
        return coordinates;
    }
    // Mutators
    set name(newName)
    {
        this._name = newName;
    }
    set address(newAddress)
    {
        this._address = newAddress;
    }
    set category(newCategory)
    {
        this._category = newCategory;
    }
    set coordinates([lng, lat])
    {
        this._coordinates.lng = lng;
        this._coordinates.lat = lat;
    }
    // Method
    /**
     * fromData method
     * This method restore the points of interest in the point of interest list
     * in each vacation in the vacation list to the PointOfInterest class instance.
     * @param {Object} data 
     */
    fromData(data)
    {
        this._name = data._name;
        this._address = data._address;
        this._category = data._category;
        let coordinates = {
            lng: data._coordinates.lng,
            lat: data._coordinates.lat
        };
        this._coordinates = coordinates;
    }
}
// PointOfInterestList class
class PointOfInterestList
{
    // Constructor
    constructor()
    {
        this._pointOfInterestList = [];
    }
    // Accessor
    get poiList()
    {
        return this._pointOfInterestList;
    }
    // Method
    /**
     * addPOI method
     * This method adds a new point of interest to the point of interest list
     * provided that the new point of interest is an instance of the PointOfInterest class.
     * @param {Object} newPointOfInterest 
     */
    addPOI(newPointOfInterest)
    {
        if (newPointOfInterest instanceof PointOfInterest)
        {
            this._pointOfInterestList.push(newPointOfInterest);
        }
    }
    /**
     * removePOI method
     * This method takes the poiIndex of a point of interest and 
     * remove the point of interest at the poiIndex from the list.
     * @param {Number} poiIndex 
     */
    removePOI(poiIndex)
    {
        let amountToRemove = 1;
        this._pointOfInterestList.splice(poiIndex, amountToRemove);
    }
    /**
     * fromData method
     * This method restores the point of interest list of each vacation
     * in the vacation list to the PointOfInterestList class.
     * @param {Object} data 
     */
    fromData(data)
    {
        this._pointOfInterestList = [];
        let poiList = data._pointOfInterestList;
        for (let i = 0; i < poiList.length; i++)
        {
            let currentPOI = poiList[i];
            let newPOI = new PointOfInterest();
            newPOI.fromData(currentPOI);
            this._pointOfInterestList.push(newPOI);
        }
    }
}
// VacationList class
class VacationList
{
    // Constructor
    constructor()
    {
        this._vacationList = [];
    }
    // Accessor
    get vacationList()
    {
        return this._vacationList;
    }
    //Method
    /**
     * addVacation method
     * This method adds a new vacation to the vacation list when a new vacation is saved
     * provided that the new vacation is an instance of the Vacation class.
     * @param {Object} newVacation 
     */
    addVacation(newVacation)
    {
        if (newVacation instanceof Vacation)
        {
            this._vacationList.push(newVacation);
        }
    }
    /**
     * removeVacation method
     * This method takes the vacationIndex of a vacation and remove the 
     * vacation at the vacationIndex from the vacation list.
     * @param {Number} vacationIndex 
     */
    removeVacation(vacationIndex)
    {
        let amountToRemove = 1;
        this._vacationList.splice(vacationIndex, amountToRemove);
    }
    /**
     * fromData method
     * This method restores the vacation list stored in the local storage
     * to the VacationList class.
     * @param {Object} data 
     */
    fromData(data)
    {
        this._vacationList = [];
        let vacationList = data._vacationList;
        for (let i = 0; i < vacationList.length; i++)
        {
            let currentVacation = vacationList[i];
            let newVacation = new Vacation();
            newVacation.fromData(currentVacation);
            this._vacationList.push(newVacation);
        }
    }
}
// Global Code
let vacationList = new VacationList();
if (checkLSData(VACATION_LIST_KEY))
{
    let data = retrieveLSData(VACATION_LIST_KEY);
    vacationList.fromData(data);
}