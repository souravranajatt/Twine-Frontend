import React, { useState } from "react";
import renderFormattedCaption from "../../../Lib/renderFormattedCaption.js";
import "../Style/PostCaption.css";

function PostCaption({ post }) {
    const [expandedCaption, setExpandedCaption] = useState(false);

    if (!post) return null;

    const hasCaption = Boolean(post.fetchPostCaption);

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
        </>
    );
}

export default PostCaption;
