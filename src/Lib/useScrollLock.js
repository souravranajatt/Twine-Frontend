import { useEffect } from 'react';

let lockCount = 0;

const useScrollLock = (isLocked) => {
    useEffect(() => {
        if (!isLocked) return;

        lockCount++;
        if (lockCount === 1) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            lockCount = Math.max(0, lockCount - 1);
            if (lockCount === 0) {
                document.body.style.overflow = "";
            }
        };
    }, [isLocked]);
};

export default useScrollLock;

