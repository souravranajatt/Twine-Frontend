import React, { useState } from "react";
import renderFormattedCaption from "../../../Lib/renderFormattedCaption.js";
import RenderTaggedUsers from "./RenderTaggedUsers.js";
import "../Style/PostCaption.css";

function PostCaption({ post }) {
    const [expandedCaption, setExpandedCaption] = useState(false);

    if (!post) return null;

    const hasCaption = Boolean(post.fetchPostCaption);
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

            {/* Tagged Users Meta Row */}
            {hasTaggedUsers && (
                <div className="postMetaInfoRow">
                    <RenderTaggedUsers taggedUsers={post.fetchTaggedUsers} />
                </div>
            )}
        </>
    );
}

export default PostCaption;
