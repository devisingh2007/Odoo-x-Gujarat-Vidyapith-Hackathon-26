import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CustomSelect.css';

export default function CustomSelect({ options, value, onChange, placeholder = 'Select...', label }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt === value);
    const displayValue = selectedOption?.label || selectedOption || placeholder;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        const val = option.value !== undefined ? option.value : option;
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="custom-select-container" ref={containerRef}>
            {label && <label className="custom-select-label">{label}</label>}
            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="select-value">{displayValue}</span>
                <ChevronDown size={18} className={`select-icon ${isOpen ? 'rotate' : ''}`} />
            </div>
            {isOpen && (
                <div className="custom-select-menu">
                    {options.map((option, index) => {
                        const optValue = option.value !== undefined ? option.value : option;
                        const optLabel = option.label || option;
                        const isSelected = optValue === value;

                        return (
                            <div
                                key={index}
                                className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                {optLabel}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
