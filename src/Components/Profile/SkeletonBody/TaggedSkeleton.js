import React from "react";
import "./ProfileSkeleton.css";

function TaggedSkeleton() {
    return (
        <div className="contentSectionDesignTagged-Box">
            <div className="connectionTaggedPostListBox">

                {/* Grid Skeleton */}
                <div className="grid-3x3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="skeleton skeletonGridItem-Box" />
                    ))}
                </div>

            </div>
        </div>
    );
}

export default TaggedSkeleton;