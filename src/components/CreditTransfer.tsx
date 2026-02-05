import React from 'react';
import { CREDIT_SYSTEMS } from '../data/creditSystems';
import type { ChecklistState } from '../types';

interface CreditTransferProps {
    selectedCreditSystem: string;
    setSelectedCreditSystem: (val: string) => void;
    checkedItems: ChecklistState;
    handleCheckToggle: (id: string) => void;
    selectedMajor: string;
    setSelectedMajor: (val: string) => void;
    handleNextToRequirements: () => void;
    markSetupComplete: () => void;
}

const CreditTransfer: React.FC<CreditTransferProps> = ({
    selectedCreditSystem,
    setSelectedCreditSystem,
    checkedItems,
    handleCheckToggle,
    selectedMajor,
    setSelectedMajor,
    handleNextToRequirements,
    markSetupComplete
}) => {
    return (
        <div className="page-container active-page">
            <div className="form-group">
                <label className="section-label" style={{ fontWeight: 'bold' }}>Select High School Credit System:</label>
                <select value={selectedCreditSystem} onChange={(e) => setSelectedCreditSystem(e.target.value)}>
                    <option value="ap">AP (Advanced Placement)</option>
                    <option value="ib">IB (International Baccalaureate)</option>
                    <option value="ale">A Level Examination</option>
                </select>
            </div>

            <div className="checklist-box">
                <h3 style={{ color: '#003660' }} className="checklist-header">{selectedCreditSystem === 'ale' ? 'A Level' : selectedCreditSystem.toUpperCase()} Courses Passed</h3>
                <ul className="checklist">
                    {CREDIT_SYSTEMS[selectedCreditSystem]?.map((course) => {
                        const isChecked = !!checkedItems[course];
                        return (
                            <li key={course} className={`checklist-item ${isChecked ? 'checked' : ''}`} style={{ listStyle: 'none' }}>
                                <label style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        id={course}
                                        checked={isChecked}
                                        onChange={() => handleCheckToggle(course)}
                                        style={{ marginRight: '10px', appearance: 'auto', WebkitAppearance: 'checkbox' }}
                                    />
                                    {course}
                                </label>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="form-group">
                <label className="section-label" style={{ fontWeight: 'bold' }}>Select Major:</label>
                <select value={selectedMajor} onChange={(e) => setSelectedMajor(e.target.value)}>
                    <option value="">-- Select --</option>
                    <option value="CS">Computer Science</option>
                    <option value="CompE">Computer Engineering</option>
                    <option value="EE">Electrical Engineering</option>
                    <option value="MechE">Mechanical Engineering</option>
                    <option value="ChemE">Chemical Engineering</option>
                    <option value="Other">Major not listed</option>
                </select>
            </div>

            <div className="button-group" style={{ justifyContent: 'center' }}>
                <button className="nav-button primary" disabled={!selectedMajor} onClick={() => {
                    markSetupComplete();
                    handleNextToRequirements();
                }}>
                    Save and view your checklist
                </button>
            </div>
        </div>
    );
};

export default CreditTransfer;
