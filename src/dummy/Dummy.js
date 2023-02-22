import React, { useState } from 'react';
import "./Dummy.css"

const Dummy = () => {
    const [select, setSelect] = useState(false)
    return (
        <div>
            <div className='main'>
                <div className='child' onClick={() => setSelect(!select)}>selector</div>
                <div className={`sub-child ${select && "hide"}`}>selector</div>
            </div>
        </div>
    );
};

export default Dummy;