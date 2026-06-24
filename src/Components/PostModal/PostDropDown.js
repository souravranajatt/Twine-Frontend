import React, { useEffect, useState, useRef } from 'react';
import { savePostAPI, unsavePostAPI, archivePostAPI } from '../../Utils/PostActionAPI';
import { useNavigate } from "react-router-dom";
import "./PostDropDown.css";

function PostDropDown({ isOpen, onClose, Post, onPostUpdate }) {

    const [localPost, setLocalPost] = useState(null);
    const [savingState, setSavingState] = useState(false);
    const [archivingState, setArchivingState] = useState(false);
    const isSavingRef = useRef(false);
    const isArchivingRef = useRef(false);
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

    // Close dropdown when isOpen is false or Post is null
    if (!isOpen || !localPost) return null;

    return (
        <div className='post-dropdown-main'>
            {localPost.ownPost ? (
                <>
                    <button className='post-dropdown-action'>Edit Post</button>
                    <button className='post-dropdown-action' style={{ color: "red", fontWeight: "600" }}>Delete Post</button>
                    <button className='post-dropdown-action' onClick={handleArchive} disabled={archivingState}>
                        {archivingState ? <div className="post-dropdown-spinner button-spinner"></div> : "Archive Post"}
                    </button>
                    <button className='post-dropdown-action'>Hide Likes</button>
                    <button className='post-dropdown-action'>Turn off commenting</button>
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
    );
}

export default PostDropDown;