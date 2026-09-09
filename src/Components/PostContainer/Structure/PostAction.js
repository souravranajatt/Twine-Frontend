import React, { useState, useRef } from "react";
import { Heart, MessageCircle, Forward, SendHorizontal } from "lucide-react";
import { likePostAPI, dislikePostAPI, postCommentAPI } from "../../../Utils/PostActionAPI.js";
import "../Style/PostAction.css";
import "../../../Assets/Bundle/GlobalSpinner.css";

function PostAction({ post, onPostUpdate, onCommentClick, onShareClick }) {
    const likingRef = useRef(false);
    const submittingCommentRef = useRef(false);

    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    if (!post) return null;

    // Handle Like / Dislike with optimistic update & error rollback
    const handleLike = async () => {
        if (!post || likingRef.current) return;
        likingRef.current = true;

        const isCurrentlyLiked = post.likedByCurrentUser;
        const previousLikeCount = post.likeCount || 0;

        const updatedPost = {
            ...post,
            likedByCurrentUser: !isCurrentlyLiked,
            likeCount: isCurrentlyLiked
                ? Math.max(0, previousLikeCount - 1)
                : previousLikeCount + 1,
        };

        if (onPostUpdate) onPostUpdate(updatedPost);

        try {
            if (isCurrentlyLiked) {
                await dislikePostAPI(post.fetchPostId);
            } else {
                await likePostAPI(post.fetchPostId);
            }
        } catch (err) {
            console.error("Like action failed:", err);
            // Rollback on failure
            const rollbackPost = {
                ...post,
                likedByCurrentUser: isCurrentlyLiked,
                likeCount: previousLikeCount,
            };
            if (onPostUpdate) onPostUpdate(rollbackPost);
        } finally {
            likingRef.current = false;
        }
    };

    // Handle Comment Submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const trimmed = commentText.trim();
        if (!trimmed || submittingCommentRef.current) return;

        submittingCommentRef.current = true;
        setSubmittingComment(true);
        setCommentText("");

        const previousCommentCount = post.commentCount || 0;

        // Optimistically increment comment count in feed
        const updatedPost = {
            ...post,
            commentCount: previousCommentCount + 1,
        };
        if (onPostUpdate) onPostUpdate(updatedPost);

        try {
            await postCommentAPI(post.fetchPostId, {
                commentText: trimmed,
                parentId: null,
            });
        } catch (error) {
            console.error("Failed to post comment:", error);
            // Rollback on failure and restore text
            const rollbackPost = {
                ...post,
                commentCount: previousCommentCount,
            };
            if (onPostUpdate) onPostUpdate(rollbackPost);
            setCommentText(trimmed);
        } finally {
            submittingCommentRef.current = false;
            setSubmittingComment(false);
        }
    };

    return (
        <div className="postBottomAction">
            {/* Actions Row: Like, Comment, Share */}
            <div className="action-toogles">
                {/* Like Button */}
                <div className="postAction-Icons">
                    <button
                        type="button"
                        className="postActionContentBtn-ToogleBox"
                        onClick={handleLike}
                        aria-label={post.likedByCurrentUser ? "Unlike post" : "Like post"}
                    >
                        <Heart
                            size={23}
                            className="bottomAction-icons"
                            fill={post.likedByCurrentUser ? "#ff3b6c" : "none"}
                            color={post.likedByCurrentUser ? "#ff3b6c" : "currentColor"}
                        />
                        {post.likeVisible === true && (
                            <span className="postActionCountText">
                                {post.likeCount || 0}
                            </span>
                        )}
                    </button>
                </div>

                {/* Comment Button (opens modal or comments section) */}
                {post.commentEnable && (
                    <div className="postAction-Icons">
                        <button
                            type="button"
                            className="postActionContentBtn-ToogleBox"
                            onClick={() => onCommentClick && onCommentClick(post)}
                            aria-label="View comments"
                        >
                            <MessageCircle size={23} className="bottomAction-icons" />
                            <span className="postActionCountText">
                                {post.commentCount || 0}
                            </span>
                        </button>
                    </div>
                )}

                {/* Share Button */}
                {post.shareEnable && (
                    <div className="postAction-Icons shareIconRight">
                        <button
                            type="button"
                            className="postActionContentBtn-ToogleBox"
                            onClick={() => onShareClick && onShareClick(post)}
                            aria-label="Share post"
                        >
                            <Forward size={23} className="bottomAction-icons" />
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Comment Input Field */}
            {post.commentEnable && (
                <div className="action-toogles commentFormToggleBox">
                    <form onSubmit={handleCommentSubmit} className="commentPost-Box">
                        <input
                            type="text"
                            className="commentPost-field"
                            placeholder="Drop a comment..."
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect="off"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={submittingComment}
                        />
                        <button
                            type="submit"
                            className="commentIcon-box"
                            disabled={submittingComment || !commentText.trim()}
                            aria-label="Send comment"
                        >
                            {submittingComment ? (
                                <span className="twine-comment-btn-spinner"></span>
                            ) : (
                                <SendHorizontal size={18} className="comment-icon" />
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default PostAction;
