import React, { useEffect, useState, useRef } from 'react';
import { savePostAPI, unsavePostAPI, archivePostAPI, hideLikeAPI, unhideLikeAPI, disableCommentingAPI, enableCommentingAPI, deletePostAPI } from '../../Utils/PostActionAPI';
import { useNavigate } from "react-router-dom";
import "./PostDropDown.css";

function PostDropDown({ isOpen, onClose, Post, onPostUpdate }) {

    const [localPost, setLocalPost] = useState(null);
    const [savingState, setSavingState] = useState(false);
    const [archivingState, setArchivingState] = useState(false);
    const [likeHidingState, setLikeHidingState] = useState(false);
    const [commentTogglingState, setCommentTogglingState] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingState, setDeletingState] = useState(false);

    const isLikeHidingRef = useRef(false);
    const isSavingRef = useRef(false);
    const isArchivingRef = useRef(false);
    const isCommentTogglingRef = useRef(false);
    const isDeletingRef = useRef(false);
    const navigate = useNavigate();


    // Keep localPost 
    useEffect(() => {
        if (isOpen && Post) {
            setLocalPost(Post);
        }
    }, [isOpen, Post]);

    // Handle copying to clipboard
    const handleCopyLink = async () => {
        try {
            const postLink = `${window.location.origin}/${localPost.username}/posts/${localPost.fetchPostId}`;
            await navigator.clipboard.writeText(postLink);
        } catch (error) {
            console.error("Failed to copy link:", error);
        }
        onClose();
    };

    // Handle Go to Post
    const goToPost = () => {
        if (localPost) {
            const cleanUsername = localPost.username.replace(/^@/, "");
            navigate(`/${cleanUsername}/posts/${localPost.fetchPostId}`);
            onClose();
        }
    };

    // Handle Save Post
    const handleSave = async () => {
        if (savingState || isSavingRef.current) return;
        isSavingRef.current = true;

        const wasSaved = localPost.savedByCurrentUser;
        const updatedPost = { ...localPost, savedByCurrentUser: !wasSaved };

        setLocalPost(updatedPost);
        if (onPostUpdate) onPostUpdate(updatedPost);
        setSavingState(true);

        try {
            if (wasSaved) {
                await unsavePostAPI(localPost.fetchPostId);
            } else {
                await savePostAPI(localPost.fetchPostId);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save post:", error);
            const rollbackPost = { ...localPost, savedByCurrentUser: wasSaved };
            setLocalPost(rollbackPost);
            if (onPostUpdate) onPostUpdate(rollbackPost);
            setSavingState(false);
            isSavingRef.current = false;
            return;
        } finally {
            setSavingState(false);
            isSavingRef.current = false;
        }
    };

    // Handle Archive Post
    const handleArchive = async () => {
        if (isArchivingRef.current || archivingState) return;
        isArchivingRef.current = true;
        setArchivingState(true);

        try {
            await archivePostAPI(localPost.fetchPostId);
            onClose();
        } catch (error) {
            console.error("Failed to archive post:", error);
            // Rollback if needed
        } finally {
            isArchivingRef.current = false;
            setArchivingState(false);
        }
    };

    // Handle Like Hide/Unhide
    const handleLikeHide = async () => {
        if (isLikeHidingRef.current || likeHidingState) return;

        const prevStatus = localPost.likeVisible;
        const newStatus = !prevStatus;
        const updatedPost = { ...localPost, likeVisible: newStatus };

        setLocalPost(updatedPost);
        if (onPostUpdate) onPostUpdate(updatedPost);

        setLikeHidingState(true);
        isLikeHidingRef.current = true;

        try {
            if (prevStatus) {
                await hideLikeAPI(localPost.fetchPostId);
            } else {
                await unhideLikeAPI(localPost.fetchPostId);
            }
            onClose();
        } catch (error) {
            console.error("Failed to hide likes:", error);
            // Roll Back on API Failure 
            const rollbackPost = { ...localPost, likeVisible: prevStatus };
            setLocalPost(rollbackPost);
            if (onPostUpdate) onPostUpdate(rollbackPost);
        } finally {
            isLikeHidingRef.current = false;
            setLikeHidingState(false);
        }
    };

    // Handle Disable/Enable Commenting on a Post 
    const handleCommentToggle = async () => {
        if (isCommentTogglingRef.current || commentTogglingState) return;

        const prevStatus = localPost.commentEnable;
        const newStatus = !prevStatus;
        const updatedPost = { ...localPost, commentEnable: newStatus };

        setLocalPost(updatedPost);
        if (onPostUpdate) onPostUpdate(updatedPost);

        setCommentTogglingState(true);
        isCommentTogglingRef.current = true;

        try {
            if (prevStatus) {
                await disableCommentingAPI(localPost.fetchPostId);
            } else {
                await enableCommentingAPI(localPost.fetchPostId);
            }
            onClose();
        } catch (error) {
            console.error("Failed to toggle comments:", error);
            // Roll Back on API Failure 
            const rollbackPost = { ...localPost, commentEnable: prevStatus };
            setLocalPost(rollbackPost);
            if (onPostUpdate) onPostUpdate(rollbackPost);
        } finally {
            isCommentTogglingRef.current = false;
            setCommentTogglingState(false);
        }
    };

    // Handle Delete Post
    const handleDeleteConfirm = async () => {
        if (isDeletingRef.current || deletingState) return;
        isDeletingRef.current = true;
        setDeletingState(true);
        try {
            await deletePostAPI(localPost.fetchPostId);
            setShowDeleteConfirm(false);
            onClose();
        } catch (error) {
            console.error("Failed to delete post:", error);
        } finally {
            isDeletingRef.current = false;
            setDeletingState(false);
        }
    };

    // Close dropdown when isOpen is false or Post is null
    if (!isOpen || !localPost) return null;

    return (<>
        <div className='post-dropdown-main'>
            {localPost.ownPost ? (
                <>
                    <button className='post-dropdown-action'>Edit Post</button>
                    <button className='post-dropdown-action' style={{ color: "red", fontWeight: "600" }} onClick={() => setShowDeleteConfirm(true)}>Delete Post</button>
                    <button className='post-dropdown-action' onClick={handleArchive} disabled={archivingState}>
                        {archivingState ? <div className="post-dropdown-spinner button-spinner"></div> : "Archive Post"}
                    </button>
                    <button className='post-dropdown-action' onClick={handleLikeHide} disabled={likeHidingState}>
                        {likeHidingState ? <div className="post-dropdown-spinner button-spinner"></div> : (localPost.likeVisible ? "Hide Likes" : "Show Likes")}
                    </button>
                    <button className='post-dropdown-action' onClick={handleCommentToggle} disabled={commentTogglingState}>
                        {commentTogglingState ? <div className="post-dropdown-spinner button-spinner"></div> : (localPost.commentEnable ? "Disable Comments" : "Enable Comments")}
                    </button>
                    <button className='post-dropdown-action' onClick={handleCopyLink}>Copy Link</button>
                </>
            ) : (
                <>
                    <button className='post-dropdown-action' style={{ color: "red", fontWeight: "600" }}>Report</button>
                    <button className='post-dropdown-action' onClick={goToPost}>Go to Post</button>
                    <button className='post-dropdown-action' onClick={handleSave} disabled={savingState}>
                        {savingState ? <div className="post-dropdown-spinner button-spinner"></div> : (localPost.savedByCurrentUser ? "Unsave Post" : "Save Post")}
                    </button>
                    <button className='post-dropdown-action' onClick={handleCopyLink}>Copy Link</button>
                </>
            )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
            <div className="delete-confirm-overlay" onClick={() => !deletingState && setShowDeleteConfirm(false)}>
                <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="delete-confirm-header">
                        <h3 className="delete-confirm-title">Delete Post?</h3>
                        <p className="delete-confirm-subtitle">This action cannot be undone. Your post will be permanently removed.</p>
                    </div>
                    <div className="delete-confirm-actions">
                        <button
                            className="pd-delete-action-btn"
                            onClick={handleDeleteConfirm}
                            disabled={deletingState}
                        >
                            {deletingState ? <div className="post-dropdown-spinner button-spinner"></div> : "Delete"}
                        </button>
                        <button
                            className="pd-cancel-action-btn"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deletingState}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>);
}

export default PostDropDown;