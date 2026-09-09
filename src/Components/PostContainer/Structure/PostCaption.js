import React, { useState } from "react";
import renderFormattedCaption from "../../../Lib/renderFormattedCaption.js";
import RenderTaggedUsers from "./RenderTaggedUsers.js";
import "../Style/PostCaption.css";

function PostCaption({ post }) {
    const [expandedCaption, setExpandedCaption] = useState(false);

    if (!post) return null;

    const hasCaption = Boolean(post.fetchPostCaption);
    const hasLocation = Boolean(post.fetchPostLocation);
    const hasTaggedUsers = Boolean(post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0);

    return (
        <>
            {/* Formatted Post Caption */}
            {hasCaption && (
                <div className="post-caption-wrapper">
                    <p className="caption-paraHead">
                        {renderFormattedCaption(
                            post.fetchPostCaption,
                            post.fetchPostId,
                            expandedCaption,
                            () => setExpandedCaption(prev => !prev),
                            post.fetchPostCaption.length
                        )}
                    </p>
                </div>
            )}

            {/* Post Location & Tagged Users Meta Row */}
            {(hasLocation || hasTaggedUsers) && (
                <div className="postMetaInfoRow">
                    {hasLocation && (
                        <span className="postMetaLocation">{post.fetchPostLocation}</span>
                    )}
                    {hasLocation && hasTaggedUsers && (
                        <span className="metaDivider">•</span>
                    )}
                    {hasTaggedUsers && (
                        <RenderTaggedUsers taggedUsers={post.fetchTaggedUsers} />
                    )}
                </div>
            )}
        </>
    );
}

export default PostCaption;
