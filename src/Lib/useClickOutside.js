import { useEffect } from 'react';

// Reusable hook — closes element when user clicks outside of it
// Pass enabled=false to temporarily disable (e.g. when a confirm modal is open on top)
function useClickOutside(ref, onClose, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        };

        // Small timeout so the button click that opened this doesn't immediately close it
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClick);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [ref, onClose, enabled]);
}

export default useClickOutside;
