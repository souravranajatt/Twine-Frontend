import React from 'react'
import "./PostDropDown.css"

function PostDropDown({ isOpen, onClose, isOwnPost, Post }) {
    return (
        <>
            <div className='post-dropdown-main'>
                {isOwnPost ? (
                    <>
                        <button className='post-dropdown-action'>Edit Post</button>
                        <button className='post-dropdown-action'>Delete Post</button>
                        <button className='post-dropdown-action'>Hide Post</button>
                        <button className='post-dropdown-action'>Hide Likes</button>
                        <button className='post-dropdown-action'>Turn off commenting</button>
                        <button className='post-dropdown-action'>Copy Link</button>
                    </>
                ) : (
                    <>
                        <button className='post-dropdown-action' style={{ color: "red", fontWeight: "600" }}>Report</button>
                        <button className='post-dropdown-action' style={{ color: "red", fontWeight: "600" }}>Unfollow</button>
                        <button className='post-dropdown-action'>Save Post</button>
                        <button className='post-dropdown-action'>Copy Link</button>
                        <button className='post-dropdown-action'>About this account</button>
                    </>
                )}
            </div>
        </>
    )
}

export default PostDropDown;