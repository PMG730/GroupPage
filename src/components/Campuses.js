import React from 'react';

const Campuses = ({ campus, handleCampusChange }) => {
    return (
        <a href="#" onClick={() => handleCampusChange(campus.id)}>
            {campus.property}
        </a>
    );
}

export default Campuses;
