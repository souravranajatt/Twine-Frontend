import { useEffect } from 'react';

function useClickOutside(ref, onClose, enabled = true, ignoreSelectors = []) {
    useEffect(() => {
        if (!enabled) return;

        const handleClick = (e) => {
            // Skip if click landed inside any ignored selector (useful for portalled modals)
            for (const selector of ignoreSelectors) {
                if (e.target.closest && e.target.closest(selector)) {
                    return;
                }
            }

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
    }, [ref, onClose, enabled, ignoreSelectors]);
}

export default useClickOutside;
