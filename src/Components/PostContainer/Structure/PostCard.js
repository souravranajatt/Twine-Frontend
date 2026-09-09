import React from "react";
import PostHeader from "./PostHeader.js";
import PostContent from "./PostContent.js";
import PostCaption from "./PostCaption.js";
import PostAction from "./PostAction.js";
import "../Style/PostCard.css";

function PostCard({
    post,
    onPostUpdate,
    onCommentClick,
    onShareClick,
    isParentModalOpen = false,
}) {
    if (!post) return null;

    return (
        <div className="postCard-wrapper">
            {/* Header: Avatar, Username, Time, 3-dot dropdown */}
            <PostHeader
                post={post}
                onPostUpdate={onPostUpdate}
            />

            {/* Content: Image or Video */}
            <PostContent
                post={post}
                isParentModalOpen={isParentModalOpen}
            />

            {/* Caption, Location, Tagged Users */}
            <PostCaption post={post} />

            {/* Actions: Like, Comment, Share + Quick comment input */}
            <PostAction
                post={post}
                onPostUpdate={onPostUpdate}
                onCommentClick={onCommentClick}
                onShareClick={onShareClick}
            />
        </div>
    );
}

export default PostCard;
