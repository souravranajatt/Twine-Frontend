import React, { useEffect, useState, useRef } from 'react';
import { savePostAPI, unsavePostAPI } from '../../Utils/PostActionAPI';
import "./PostDropDown.css";

function PostDropDown({ isOpen, onClose, Post, onPostUpdate }) {

    const [localPost, setLocalPost] = useState(null);
    const [savingState, setSavingState] = useState(false);
    const isSavingRef = useRef(false);


    // Keep localPost in sync 
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
        } catch (error) {
            console.error("Failed to save post:", error);
            const rollbackPost = { ...localPost, savedByCurrentUser: wasSaved };
            setLocalPost(rollbackPost);
            if (onPostUpdate) onPostUpdate(rollbackPost);
            setSavingState(false);
            isSavingRef.current = false;
            return;
        }

        setSavingState(false);
        isSavingRef.current = false;
        onClose();
    };

    // Close dropdown when isOpen is false or Post is null
    if (!isOpen || !localPost) return null;

    return (
        <div className='post-dropdown-main'>
            {localPost.ownPost ? (
                <>
                    <button className='post-dropdown-action'>Edit Post</button>
                    <button className='post-dropdown-action' style={{ color: "red", fontWeight: "600" }}>Delete Post</button>
                    <button className='post-dropdown-action'>Archive Post</button>
                    <button className='post-dropdown-action'>Hide Likes</button>
                    <button className='post-dropdown-action'>Turn off commenting</button>
                    <button className='post-dropdown-action' onClick={handleCopyLink}>Copy Link</button>
                </>
            ) : (
                <>
                    <button className='post-dropdown-action' style={{ color: "red", fontWeight: "600" }}>Report</button>
                    <button className='post-dropdown-action'>Go to Post</button>
                    <button className='post-dropdown-action' onClick={handleSave}>{localPost.savedByCurrentUser ? "Unsave Post" : "Save Post"}</button>
                    <button className='post-dropdown-action' onClick={handleCopyLink}>Copy Link</button>
                    <button className='post-dropdown-action'>About this account</button>
                </>
            )}
        </div>
    );
}

export default PostDropDown;