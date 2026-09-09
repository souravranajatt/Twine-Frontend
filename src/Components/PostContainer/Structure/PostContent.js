import React from "react";
import CustomVideoPlayer from "../../../Lib/CustomVideoPlayer.js";
import "../Style/PostContent.css";

function PostContent({ post, isParentModalOpen = false }) {
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
            </div>
        </div>
    );
}

export default PostContent;
