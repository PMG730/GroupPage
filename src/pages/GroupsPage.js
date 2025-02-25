import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // If using React Router
import LifeGroupsList from "../components/LifeGroupTypes"; // Updated import
import DropCampus from "../components/Campuses";
import Group from "../components/Groups";

function GroupsPage() {
  let [campuses, setCampuses] = useState([]);
  let [lifeGroups, setLifeGroups] = useState([]);
  let [day, setDay] = useState("");
  let [timeOfDay, setTimeOfDay] = useState("");
  let [lifeGroup, setLifeGroup] = useState("");
  let [campus, setCampus] = useState(""); // Added campus state
  let [groupData, setGroups] = useState([]); // Added state for groups

  // Function to update query parameter
  const updateQueryParam = (param, value) => {
    const url = new URL(window.location);
    if (value !== null && value !== undefined) {
      url.searchParams.set(param, value.toString().toLowerCase()); // Convert value to a string first
    } else {
      url.searchParams.delete(param); // Remove the query parameter if no value
    }
    window.history.pushState({}, "", url); // Update the browser URL without reloading the page
  };

  const handleDayChange = (selectedDay) => {
    setDay(selectedDay);
    updateQueryParam("day", selectedDay); // Update the 'day' query param
  };
  const handleCampusChange = (selectedCampus) => {
    setCampus(selectedCampus);
    updateQueryParam("campus", selectedCampus); // Update the 'day' query param
  };

  const handleTimeOfDayChange = (selectedTime) => {
    setTimeOfDay(selectedTime);
    updateQueryParam("timeOfDay", selectedTime); // Update the 'timeOfDay' query param
  };

  const handleLifeGroupChange = (selectedLifeGroup) => {
    setLifeGroup(selectedLifeGroup);
    updateQueryParam("lifeGroup", selectedLifeGroup); // Update the 'lifeGroup' query param
  };

  let GetCampusLocations = async () => {
    try {
      let response = await fetch("/api/v2/groups/categories/3/properties", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-prettyPrint": "true",
          "X-SESSIONID": "b110365fb80d8fa7f44b3132db68fe0f",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.data); // Log the fetched data

      // Sort campuses by id before setting state
      const sortedCampuses = data.data.sort((a, b) => a.id - b.id);
      setCampuses(sortedCampuses); // Set sorted campuses in state
    } catch (error) {
      console.error("Error fetching campus data:", error);
    }
  };

  let GetLifeGroupTypes = async () => {
    try {
      let response = await fetch("/api/v2/groups/categories/4/properties", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-prettyPrint": "true",
          "X-SESSIONID": "b110365fb80d8fa7f44b3132db68fe0f",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.data); // Now log after data is fetched

      setLifeGroups(data.data); // Set life groups in state
    } catch (error) {
      console.error("Error fetching life group types data:", error);
    }
  };

  let GroupData = async () => {
    try {
      let response = [];
      const headers = {
        Accept: "application/json",
        "X-prettyPrint": "true",
        "X-SESSIONID": "b110365fb80d8fa7f44b3132db68fe0f",
      };

      let campusResponse = [];
      let lifeGroupResponse = [];

      if (!campus && !lifeGroup) {
        const fetchResponse = await fetch("/api/v2/groups?selfRequest=1", {
          method: "GET",
          headers,
        });

        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          response = data.data || [];
        } else {
          console.error(`HTTP error! status: ${fetchResponse.status}`);
        }
      } else {
        if (campus) {
          const fetchCampusResponse = await fetch(
            `/api/v2/groups?propertyIds%5B%5D=${encodeURIComponent(
              campus
            )}&selfRequest=1`,
            {
              method: "GET",
              headers,
            }
          );
          campusResponse = fetchCampusResponse.ok
            ? (await fetchCampusResponse.json()).data || []
            : [];
        }
        if (lifeGroup) {
          const fetchLifeGroupResponse = await fetch(
            `/api/v2/groups?propertyIds%5B%5D=${encodeURIComponent(
              lifeGroup
            )}&selfRequest=1`,
            {
              method: "GET",
              headers,
            }
          );
          lifeGroupResponse = fetchLifeGroupResponse.ok
            ? (await fetchLifeGroupResponse.json()).data || []
            : [];
        }
        if(lifeGroup & campus){
        const commonGroups = lifeGroupResponse.filter((group) =>
          campusResponse.some((campus) => campus.guid === group.guid)
        );
        response = commonGroups;
      }else if(lifeGroup){
        response = lifeGroupResponse
      }else{
        response = campusResponse
      }

      }

      if (day) {
        response = response.filter((group) => group.meetingDay === day);
      }
      if (timeOfDay) {
        response = response.filter((group) => group.timeOfDay === timeOfDay);
      }

      // Set the fetched groups into the state
      console.log(lifeGroup)
      setGroups(response);
    } catch (error) {
      console.error("Error fetching group data:", error);
      setGroups([]);
    }
  };

  useEffect(() => {
    GetCampusLocations();
    GetLifeGroupTypes();
    const params = new URLSearchParams(window.location.search);
    setDay(params.get("day") || "");
    setTimeOfDay(params.get("timeOfDay") || "");
    setLifeGroup(params.get("lifeGroup") || "");
    setCampus(params.get("campus") || "");
  }, []);

  useEffect(() => {
    GroupData();
  }, [day, timeOfDay, lifeGroup, campus]);

  return (
    <div className="app-groupsPage">
      <h2>Find a Group</h2>
      <div className="container">
        <div className="dropdown">
          <button className="dropdown-button">Campuses</button>
          <div className="dropdown-menu">
            <a href="#" onClick={() => handleCampusChange("")}>Any Campus</a>
            {campuses.map((campus, index) => (
              <DropCampus
                key={index}
                campus={campus}
                handleCampusChange={handleCampusChange}
              />
            ))}
          </div>
        </div>

        <div className="dropdown">
          <button className="dropdown-button">LifeGroup Type</button>
          <div className="dropdown-menu">
            <a href="#" onClick={() => handleLifeGroupChange("")}>Any LifeGroup</a>
            {lifeGroups.map((lifegroup, index) => (
              <LifeGroupsList
                key={index}
                lifegroup={lifegroup}
                handleLifeGroupChange={handleLifeGroupChange}
              />
            ))}
          </div>
        </div>

        <div className="dropdown">
          <button className="dropdown-button">Meeting Day</button>
          <div className="dropdown-menu">
            <a href="#" onClick={() => handleDayChange("")}>Any Meeting day</a>
            <a href="#" onClick={() => handleDayChange("Sunday")}>Sunday</a>
            <a href="#" onClick={() => handleDayChange("Monday")}>Monday</a>
            <a href="#" onClick={() => handleDayChange("Tuesday")}>Tuesday</a>
            <a href="#" onClick={() => handleDayChange("Wednesday")}>Wednesday</a>
            <a href="#" onClick={() => handleDayChange("Thursday")}>Thursday</a>
            <a href="#" onClick={() => handleDayChange("Friday")}>Friday</a>
            <a href="#" onClick={() => handleDayChange("Saturday")}>Saturday</a>
          </div>
        </div>

        <div className="dropdown">
          <button className="dropdown-button">Time of Day</button>
          <div className="dropdown-menu">
            <a href="#" onClick={() => handleTimeOfDayChange("")}>Any Day</a>
            <a href="#" onClick={() => handleTimeOfDayChange("Morning")}>Morning</a>
            <a href="#" onClick={() => handleTimeOfDayChange("Afternoon")}>Afternoon</a>
            <a href="#" onClick={() => handleTimeOfDayChange("Evening")}>Evening</a>
          </div>
        </div>
      </div>

      <div className="titleContainer">
        <h2>Group</h2>
        <h2>Details</h2>
      </div>

      {groupData.map((group, index) => (
        <Group key={index} GroupData={group} index={index} />
      ))}
    </div>
  );
}

export default GroupsPage;
