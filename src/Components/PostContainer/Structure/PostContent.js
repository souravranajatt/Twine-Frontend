import React from "react";
import CustomVideoPlayer from "../../../Lib/CustomVideoPlayer.js";
import RenderTaggedUsers from "./RenderTaggedUsers.js";
import "../Style/PostContent.css";

function PostContent({ post, isParentModalOpen = false }) {
    const hasTaggedUsers = Boolean(post?.fetchTaggedUsers && post.fetchTaggedUsers.length > 0);
    if (!post) return null;

    // Video height for maintain the aspect ratio
    const paddingBottom = (post.width && post.height)
        ? `${(post.height / post.width) * 100}%`
        : "100%";

    return (
        <div className="postFeedMainContent">
            <div className="postMainFeedContentMiddleBox" style={{ paddingBottom }}>
                {post.postType === "VIDEO" ? (
                    <CustomVideoPlayer
                        src={post.fetchFileName}
                        className="mainContentMediaBox video-post"
                        isParentModalOpen={isParentModalOpen}
                    />
                ) : (
                    <img
                        src={post.fetchFileName}
                        alt="post-content"
                        className="mainContentMediaBox image-post"
                        loading="lazy"
                    />
                )}

                {/* Tagged Users — frosted glass overlay, bottom-left of photo */}
                {hasTaggedUsers && (
                    <div className="postContent-tagged-overlay">
                        <RenderTaggedUsers taggedUsers={post.fetchTaggedUsers} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default PostContent;
