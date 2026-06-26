import React from "react";
import "./ProfileSkeleton.css";

function PostsSkeleton() {
    return (
        <>
            {[1, 2].map((i) => (
                <div key={i} className="profilePostCard-Box">

                    {/* Post Header */}
                    <div className="skeletonPostHeader-Box">
                        <div className="skeleton skeletonPostPFP-Box" />
                        <div className="skeletonPostNameWrap-Box">
                            <div className="skeleton skeletonPostName-Box" />
                            <div className="skeleton skeletonPostTime-Box" />
                        </div>
                    </div>

                    {/* Post Media */}
                    <div className="skeleton skeletonPostMedia-Box" />

                    {/* Post Caption */}
                    <div className="skeletonPostCaption-Box">
                        <div className="skeleton skeletonCaptionLine-Box" />
                        <div className="skeleton skeletonCaptionLineShort-Box" />
                    </div>

                    {/* Post Actions */}
                    <div className="skeletonPostActions-Box">
                        <div className="skeleton skeletonActionIcon-Box" />
                        <div className="skeleton skeletonActionIcon-Box" />
                        <div className="skeleton skeletonActionIcon-Box" />
                    </div>

                </div>
            ))}
        </>
    );
}

export default PostsSkeleton;