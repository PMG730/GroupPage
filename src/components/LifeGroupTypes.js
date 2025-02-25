import React from 'react';

const LifeGroupsList = ({ lifegroup, handleLifeGroupChange }) => {
    return (
        <a href="#" onClick={() => handleLifeGroupChange(lifegroup.id)}>
            {lifegroup.property}
        </a>
    );
};

export default LifeGroupsList;
