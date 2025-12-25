import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface BeforeAfterToggleProps {
    isComparing: boolean;
    onToggle: (val: boolean) => void;
}

export const BeforeAfterToggle: React.FC<BeforeAfterToggleProps> = ({ isComparing, onToggle }) => {
    return (
        <button
            className={`p-2 rounded-lg transition-colors ${isComparing ? 'bg-vintage-accent text-black' : 'hover:bg-gray-800 text-gray-500 hover:text-white'}`}
            onMouseDown={() => onToggle(true)}
            onMouseUp={() => onToggle(false)}
            onMouseLeave={() => onToggle(false)}
            onTouchStart={() => onToggle(true)}
            onTouchEnd={() => onToggle(false)}
            title="Hold to Compare (\)"
        >
            {isComparing ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
    );
};
