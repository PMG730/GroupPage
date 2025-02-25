import React from "react";
 
function Group({ GroupData, index }) {
  const { name, description, leaders } = GroupData; // Assuming these keys from the fetched data
 
  return (
    <div className={`GroupContainer ${index % 2 !== 0 ? "dark" : ""}`}>
      <div>
        <h2>{name}</h2>
        {/* Render the description as HTML content */}
        <p dangerouslySetInnerHTML={{ __html: description }} />
      </div>
      <div>
        <p>Leader(s):</p>
        <br />
        {leaders && leaders.length > 0 ? (
          leaders.map((leader, i) => (
            <p key={i}>
              {leader.fname} {leader.lname}
            </p>
          ))
        ) : (
          <p>No leaders available</p>
        )}
      </div>
    </div>
  );
}
 
export default Group;
 