import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // If using React Router
import LifeGroupsList from "../components/LifeGroupTypes"; // Updated import
import DropCampus from "../components/Campuses";
import Group from "../components/Groups";
 
function GroupsPage() {
  const API_BASE_URL = process.env.REACT_APP_API_URL
  let [campuses, setCampuses] = useState([]);
  let [lifeGroups, setLifeGroups] = useState([]);
  let [day, setDay] = useState("");
  let [timeOfDay, setTimeOfDay] = useState("");
  let [lifeGroup, setLifeGroup] = useState("");
  let [campus, setCampus] = useState(""); // Added campus state
  let [groupData, setGroups] = useState([]); // Added state for groups
  let [campusLabel, setCampusLabel] = useState("Any Campus"); // To hold the label for UI
  let [lifeGroupLabel, setLifeGroupLabel] = useState("Any LifeGroup"); // To hold the label for UI
 
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
  const handleCampusChange = (selectedCampus, label) => {
    setCampus(selectedCampus);
    setCampusLabel(label);
    updateQueryParam("campus", selectedCampus);
  };
 
  const handleTimeOfDayChange = (selectedTime) => {
    setTimeOfDay(selectedTime);
    updateQueryParam("timeOfDay", selectedTime); // Update the 'timeOfDay' query param
  };
 
  const handleLifeGroupChange = (selectedLifeGroup, label) => {
    setLifeGroup(selectedLifeGroup);
    setLifeGroupLabel(label);
    updateQueryParam("lifeGroup", selectedLifeGroup); // Update the 'lifeGroup' query param
  };
 
  let GetCampusLocations = async (campus) => {
    try {
      let response = await fetch(`${API_BASE_URL}/api/v2/groups/categories/3/properties`, {
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
      const theCampus = data.data.filter((thedata) => thedata.id == campus);
      console.log("campus in GetCampusLocation is : " +campus)
      console.log(theCampus);
      console.log(theCampus[0].property)
      setCampusLabel(theCampus[0].property);
    } catch (error) {
      console.error("Error fetching campus data:", error);
    }
  };
 
  let GetLifeGroupTypes = async (lifeGroup) => {
    try {
      let response = await fetch(`${API_BASE_URL}/api/v2/groups/categories/4/properties`, {
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
      const theLifeGroup = data.data.filter((thedata) => thedata.id == lifeGroup);
      if(theLifeGroup[0]){
      setLifeGroupLabel(theLifeGroup[0].property);
      }
 
      setLifeGroups(data.data); // Set life groups in state
    } catch (error) {
      console.error("Error fetching life group types data:", error);
    }
  };
 
  let GroupData = async (campusParam, lifeGroupParam, dayParam, timeOfDayParam) => {
    try {
        console.log("Campus is: " + campusParam + "Life Group is: " + lifeGroupParam + "Day is: " + dayParam + "Time is: " + timeOfDayParam);
        let response = [];
        const headers = {
            Accept: "application/json",
            "X-prettyPrint": "true",
            "X-SESSIONID": "b110365fb80d8fa7f44b3132db68fe0f",
        };
 
        let campusResponse = [];
        let lifeGroupResponse = [];
 
        // If neither campus nor life group is selected, fetch all groups
        if (!campusParam && !lifeGroupParam) {
            const fetchResponse = await fetch(`${API_BASE_URL}/api/v2/groups?selfRequest=1`, {
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
            // Fetch groups by campus if campus is selected
            if (campusParam) {
                const fetchCampusResponse = await fetch(
                    `${API_BASE_URL}/api/v2/groups?propertyIds%5B%5D=${encodeURIComponent(campusParam)}&selfRequest=1`,
                    {
                        method: "GET",
                        headers,
                    }
                );
                campusResponse = fetchCampusResponse.ok
                    ? (await fetchCampusResponse.json()).data || []
                    : [];
            }
 
            // Fetch groups by life group if life group is selected
            if (lifeGroupParam) {
                const fetchLifeGroupResponse = await fetch(
                    `${API_BASE_URL}/api/v2/groups?propertyIds%5B%5D=${encodeURIComponent(lifeGroupParam)}&selfRequest=1`,
                    {
                        method: "GET",
                        headers,
                    }
                );
                lifeGroupResponse = fetchLifeGroupResponse.ok
                    ? (await fetchLifeGroupResponse.json()).data || []
                    : [];
            }
 
            // When both filters are applied, find the intersection between campus and life group
            if (campusParam && lifeGroupParam) {
                const commonGroups = lifeGroupResponse.filter((group) =>
                    campusResponse.some((campus) => campus.gid === group.gid)
                );
                response = commonGroups;
            } else if (campusParam) {
                response = campusResponse;
            } else if (lifeGroupParam) {
                response = lifeGroupResponse;
            }
        }
 
        // Filter by day and timeOfDay if selected
        if (dayParam) {
            response = response.filter((group) => group.meetingDay === dayParam);
        }
        if (timeOfDayParam) {
          console.log("Filtering groups based on time of day:", timeOfDayParam);
     
          // Define the time ranges for Morning, Afternoon, and Evening
          const timeRanges = {
              morning: { start: 6, end: 11 }, // 6:00 AM to 11:59 AM
              afternoon: { start: 12, end: 16 }, // 12:00 PM to 4:59 PM
              evening: { start: 17, end: 23 }, // 5:00 PM to 11:59 PM
          };
     
          // Ensure timeOfDayParam is lowercase to match the timeRanges keys
          const normalizedTimeOfDay = timeOfDayParam.toLowerCase();
     
          // Function to parse the time string (e.g., "3:00 PM") into 24-hour format hour
          const parseTimeTo24Hour = (timeString) => {
              timeString = timeString.toLowerCase();
              const [time, period] = timeString.split(" "); // Split into time and period (AM/PM)
              let [hours, minutes] = time.split(":").map(Number); // Split hours and minutes
             
              // Convert to 24-hour format
              if (period === "pm" && hours < 12) hours += 12; // Convert PM times
              if (period === "am" && hours === 12) hours = 0; // Convert 12 AM to 0 hour
              return hours; // Return the hour in 24-hour format
          };
     
          // Check if timeOfDayParam exists in timeRanges, if not log an error and exit
          if (!timeRanges[normalizedTimeOfDay]) {
              console.error(`Invalid timeOfDayParam: ${timeOfDayParam}`);
              return;
          }
     
          // Filter the response array based on timeOfDay
          response = response.filter((group) => {
              console.log("Checking group:", group); // Log each group being checked
     
              // Parse the group.meetingTime (e.g., "3:00 PM") into 24-hour format
              const hour = parseTimeTo24Hour(group.meetingTime);
              console.log(`Group meeting time: ${group.meetingTime}, Parsed hour: ${hour}`); // Log parsed hour
     
              // Check if the hour is within the selected timeOfDay range
              const timeRange = timeRanges[normalizedTimeOfDay];
              console.log(`Comparing hour ${hour} with ${timeOfDayParam} range: ${timeRange.start} - ${timeRange.end}`);
             
              const isInTimeRange = hour >= timeRange.start && hour <= timeRange.end;
              console.log(`Group is within time range: ${isInTimeRange}`);
             
              return isInTimeRange; // Include the group if it matches the time range
          });
      }
     
 
        // Set the fetched groups into the state
        console.log(response);
        setGroups(response);
    } catch (error) {
        console.error("Error fetching group data:", error);
        setGroups([]);
    }
};
 
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const campusParam = params.get("campus") || "";
  const lifeGroupParam = params.get("lifeGroup") || "";
  const dayParam = params.get("day") || "";
  const timeOfDayParam = params.get("timeOfDay") || "";
 
  // Set state based on URL params
  setDay(dayParam);
  setTimeOfDay(timeOfDayParam);
  setLifeGroup(lifeGroupParam);
  setCampus(campusParam);
 
  // Call the necessary functions regardless of whether data is set or not
  GetCampusLocations(campusParam);
  GetLifeGroupTypes(lifeGroupParam);
  GroupData(campusParam, lifeGroupParam, dayParam, timeOfDayParam);
}, []); // Runs only on mount
 
 
 
useEffect(() => {
  // If any of the relevant states change, only call GroupData again
 
      GroupData(campus, lifeGroup, day, timeOfDay);
 
}, [campus, lifeGroup, day, timeOfDay]); // Triggers when any of these state values change
 
  return (
    <div className="app-groupsPage">
      <h2>Find a Group</h2>
      <div className="container">
        <div className="dropdown">
          <button className="dropdown-button">{campusLabel}</button>
          <div className="dropdown-menu">
            <a href="#" onClick={() => handleCampusChange("", "Any Campus")}>
              Any Campus
            </a>
            {campuses.map((thecampus, index) => (
              <DropCampus
                key={index}
                campus={thecampus}
                handleCampusChange={handleCampusChange}
              />
            ))}
          </div>
        </div>
 
        <div className="dropdown">
          <button className="dropdown-button">{lifeGroupLabel}</button>
          <div className="dropdown-menu">
            <a
              href="#"
              onClick={() => handleLifeGroupChange("", "Any LifeGroup")}
            >
              Any LifeGroup
            </a>
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
          <button className="dropdown-button">
            {day ? day : "Any Meeting Day"}
          </button>
          <div className="dropdown-menu">
            <a href="#" onClick={() => handleDayChange("")}>
              Any Meeting Day
            </a>
            <a href="#" onClick={() => handleDayChange("Sunday")}>
              Sunday
            </a>
            <a href="#" onClick={() => handleDayChange("Monday")}>
              Monday
            </a>
            <a href="#" onClick={() => handleDayChange("Tuesday")}>
              Tuesday
            </a>
            <a href="#" onClick={() => handleDayChange("Wednesday")}>
              Wednesday
            </a>
            <a href="#" onClick={() => handleDayChange("Thursday")}>
              Thursday
            </a>
            <a href="#" onClick={() => handleDayChange("Friday")}>
              Friday
            </a>
            <a href="#" onClick={() => handleDayChange("Saturday")}>
              Saturday
            </a>
          </div>
        </div>
 
        <div className="dropdown">
          <button className="dropdown-button">
            {timeOfDay ? timeOfDay : "Any Time of Day"}
          </button>
          <div className="dropdown-menu">
            <a href="#" onClick={() => handleTimeOfDayChange("")}>
              Any Time of Day
            </a>
            <a href="#" onClick={() => handleTimeOfDayChange("Morning")}>
              Morning
            </a>
            <a href="#" onClick={() => handleTimeOfDayChange("Afternoon")}>
              Afternoon
            </a>
            <a href="#" onClick={() => handleTimeOfDayChange("Evening")}>
              Evening
            </a>
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