import React from "react";
import "./ProfileSkeleton.css";

function TimelineSkeleton() {
    return (
        <div className="contentSectionDesignTimeline-Box">
            <div className="timelineConectionContentMainBox">

                {/* Header Bar Skeleton */}
                <div className="skeleton skeletonTimelineHeader-Box" />

                {/* Post Header Skeleton */}
                <div className="skeletonTimelinePostHeader-Box">
                    <div className="skeleton skeletonTimelinePostHeaderLine-Box" />
                </div>

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

export default TimelineSkeleton;