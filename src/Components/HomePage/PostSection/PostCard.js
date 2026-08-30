import React, { useState, useEffect, useRef } from "react";
import { Image, Heart, Tag, MapPin, Check, X, Search } from "lucide-react";
import "./PostCard.css";
import "../../../Assets/Bundle/GlobalSpinner.css";
import { uploadPostAPI } from "../../../Utils/PostFeaturesAPI.js";
import { searchUsersForTaggingAPI } from "../../../Utils/searchAPI.js";
import useDebounce from "../../../Lib/useDebounce.js";
import PostCardSkeleton from "./PostCardSkeleton.js";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function PostCard({ loggedUserData }) {

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [captionPost, setCaption] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [timeLineUserPost, setTimeLineUserPost] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("idle"); // "idle" | "uploading" | "done" | "error"
    const uploadingRef = useRef(false);   // synchronous guard (double submit rokne ke liye)
    const MAX_SIZE = 500 * 1024 * 1024;
    const fileInputRef = useRef(null);

    const [isTagOpen, setIsTagOpen] = useState(false);
    const [taggedUsers, setTaggedUsers] = useState([]);
    const [searchTagQuery, setSearchTagQuery] = useState("");
    const [tagSearchResults, setTagSearchResults] = useState([]);
    const [isSearchingTags, setIsSearchingTags] = useState(false);

    const debouncedTagQuery = useDebounce(searchTagQuery, 300);

    useEffect(() => {
        return () => preview && URL.revokeObjectURL(preview);
    }, [preview]);

    useEffect(() => {
        if (!debouncedTagQuery.trim()) {
            setTagSearchResults([]);
            setIsSearchingTags(false);
            return;
        }

        const controller = new AbortController();
        setIsSearchingTags(true);

        const fetchTagUsers = async () => {
            try {
                const res = await searchUsersForTaggingAPI(debouncedTagQuery, controller.signal);
                const list = Array.isArray(res) ? res : (res?.users || res?.data || []);
                setTagSearchResults(list);
            } catch (err) {
                if (err?.name !== "AbortError" && err?.name !== "CanceledError") {
                    setTagSearchResults([]);
                }
            } finally {
                setIsSearchingTags(false);
            }
        };

        fetchTagUsers();

        return () => {
            controller.abort();
        };
    }, [debouncedTagQuery]);

    if (!loggedUserData) return <PostCardSkeleton />;

    // Toggle Tag User
    const toggleTagUser = (user) => {
        const canTag = user.allowTagging !== false;
        if (!canTag) return;

        const uId = user.userId || user._id || user.id;
        setTaggedUsers((prev) => {
            const exists = prev.some((u) => (u.userId || u._id || u.id) === uId);
            if (exists) {
                setError("");
                return prev.filter((u) => (u.userId || u._id || u.id) !== uId);
            }
            if (prev.length >= 10) {
                setError("You can only tag up to 10 users!");
                return prev;
            }
            setError("");
            return [...prev, user];
        });
    };

    // File Choose Handle
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        const validTypes = ["image/jpeg", "image/heic", "image/png", "image/jpg",
            "video/mp4", "video/quicktime", "video/mov"];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Only image or video file are allowed!");
            setFile(null); setPreview(null); setSuccess(""); return;
        }
        setError(""); setSuccess("");
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    // Post Upload
    const postLive = async (e) => {
        e.preventDefault();

        // 1. Guard: double submit prevent
        if (uploadingRef.current) return;

        // 2. Validations
        if (!file) { setError("Please select an image or video!"); return; }
        if (captionPost.length > 1000) { setError("Caption too long! (1000 limit)"); return; }
        if (file.size > MAX_SIZE) { setError("File too large! (500 MB limit)"); return; }
        if (taggedUsers.length > 10) { setError("You can only tag up to 10 users!"); return; }

        // 3. Lock + Reset UI state
        uploadingRef.current = true;
        setIsUploading(true);
        setUploadStatus("uploading");
        setError("");
        setSuccess("");

        // 4. Build FormData
        const formData = new FormData();
        formData.append("postCaption", captionPost);
        formData.append("file", file);
        if (timeLineUserPost === 1) formData.append("postTimelineUser", timeLineUserPost);
        taggedUsers.forEach((u) => formData.append("taggedUsers", u.userId || u._id || u.id));

        // 5. API Call
        try {
            await uploadPostAPI(formData);

            // 6. Success: reset form + show success
            setFile(null);
            setPreview(null);
            setCaption("");
            setTimeLineUserPost(0);
            setTaggedUsers([]);
            setIsTagOpen(false);
            setSearchTagQuery("");
            setUploadStatus("done");
            setSuccess("Post Uploaded!");
            setTimeout(() => {
                setSuccess("");
                setUploadStatus("idle");
            }, 4000);
        } catch (err) {
            // 7. Error: extract message safely
            const msg =
                typeof err === "string" ? err :
                    err?.message || err?.error || "Upload failed! Try again.";
            setError(msg);
            setUploadStatus("error");
            setTimeout(() => setUploadStatus("idle"), 3000);
        } finally {
            // 8. Unlock
            uploadingRef.current = false;
            setIsUploading(false);
        }
    };



    return (
        <div className="side-bar-box">

            {/* Profile Card */}
            <div className="profile-card-box">
                <div className="sideProfilePicHeader">
                    <img
                        src={loggedUserData?.profilePhoto &&
                            loggedUserData.profilePhoto !== "null"
                            ? loggedUserData.profilePhoto : DEFAULT_IMAGE}
                        alt="profileImage"
                        className="sidePhotoImageBox"
                    />
                </div>
                <div className="side-info-box">
                    <p className="fullname-tagbox">{loggedUserData?.fullName}</p>
                    <p className="username-tagbox">@{loggedUserData?.userName}</p>
                </div>
            </div>

            {/* Create Post */}
            <div className="createPost-card-box">
                <p className="createPost-header">Create Post</p>
                <form className="post-form" onSubmit={postLive}>

                    <div className="createPost-fields">
                        <input type="file" accept="image/*,video/*"
                            ref={fileInputRef} onChange={handleFileChange}
                            className="postFile" />
                        <div className="postIconBtn-Design">
                            <button type="button" className="postBtnAsIconToogle-Box"
                                onClick={() => fileInputRef.current.click()}>
                                <Image size={21} className="iconPost" />
                            </button>
                        </div>
                        {loggedUserData.uTimeline && (
                            <div className="postIconBtn-Design">
                                <button type="button" className="postBtnAsIconToogle-Box"
                                    onClick={() => setTimeLineUserPost(p => p === 0 ? 1 : 0)}>
                                    <Heart size={21}
                                        className={timeLineUserPost === 1
                                            ? "iconPostTimelineChange" : "iconPost"} />
                                </button>
                            </div>
                        )}
                        <div className="postIconBtn-Design">
                            <button type="button" className="postBtnAsIconToogle-Box">
                                <MapPin size={21} className="iconPost" />
                            </button>
                        </div>
                        <div className="postIconBtn-Design">
                            <button
                                type="button"
                                className={`postBtnAsIconToogle-Box ${isTagOpen ? "twine-tag-active-btn" : ""}`}
                                onClick={() => setIsTagOpen(prev => !prev)}
                            >
                                <Tag size={21} className={isTagOpen ? "twine-tag-active-icon" : "iconPost"} />
                            </button>
                        </div>
                    </div>

                    {taggedUsers.length > 0 && (
                        <div className="twine-tagged-chips-container">
                            {taggedUsers.map((user) => (
                                <div key={user.userId || user._id || user.id} className="twine-tagged-user-chip">
                                    <img
                                        src={user.profileImage || user.profilePhoto || DEFAULT_IMAGE}
                                        alt={user.username || user.userName}
                                        className="twine-tagged-chip-img"
                                    />
                                    <span className="twine-tagged-chip-text">@{user.username || user.userName}</span>
                                    <button
                                        type="button"
                                        className="twine-tagged-chip-remove"
                                        onClick={() => toggleTagUser(user)}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {isTagOpen && (
                        <div className="twine-tag-panel-box">
                            <div className="twine-tag-search-field">
                                <Search size={15} className="twine-tag-search-icon" />
                                <input
                                    type="text"
                                    className="twine-tag-input-element"
                                    placeholder="Search user to tag..."
                                    value={searchTagQuery}
                                    onChange={(e) => setSearchTagQuery(e.target.value)}
                                    autoFocus
                                />
                                {searchTagQuery && (
                                    <button
                                        type="button"
                                        className="twine-tag-search-clear-btn"
                                        onClick={() => setSearchTagQuery("")}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {isSearchingTags && (
                                <div className="twine-postmodal-spinner-center">
                                    <span className="post-dropdown-spinner"></span>
                                </div>
                            )}

                            {!isSearchingTags && searchTagQuery.trim() !== "" && tagSearchResults.length === 0 && (
                                <p className="twine-tag-status-text">No user found</p>
                            )}

                            {!isSearchingTags && tagSearchResults.length > 0 && (
                                <div className="twine-tag-results-list">
                                    {tagSearchResults.map((user) => {
                                        const uId = user.userId || user._id || user.id;
                                        const isChecked = taggedUsers.some((u) => (u.userId || u._id || u.id) === uId);
                                        const canTag = user.allowTagging !== false;

                                        return (
                                            <div
                                                key={uId}
                                                className={`twine-tag-user-row ${isChecked ? "twine-tag-user-row-selected" : ""} ${!canTag ? "twine-tag-user-row-disabled" : ""}`}
                                                onClick={() => canTag && toggleTagUser(user)}
                                            >
                                                <div className="twine-tag-user-profile-group">
                                                    <img
                                                        src={user.profileImage || user.profilePhoto || DEFAULT_IMAGE}
                                                        alt={user.username || user.userName}
                                                        className="twine-tag-user-avatar-img"
                                                    />
                                                    <div className="twine-tag-user-details">
                                                        <span className="twine-tag-user-username-text">@{user.username || user.userName}</span>
                                                        {!canTag && <span className="twine-tag-disabled-text">Tagging off</span>}
                                                    </div>
                                                </div>
                                                {canTag && (
                                                    <div className={`twine-tag-circle-checkbox ${isChecked ? "twine-tag-circle-checkbox-checked" : ""}`}>
                                                        {isChecked && <Check size={12} className="twine-tag-circle-check-svg" />}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {preview && (
                        <div className="createPost-fields">
                            {file?.type.startsWith("image/") ? (
                                <img src={preview} className="previewPost" alt="Preview" />
                            ) : (
                                <video src={preview} className="previewPost" controls />
                            )}
                        </div>
                    )}

                    {error && <p className="errorPost">{error}</p>}
                    {success && <p className="successPost">{success}</p>}

                    {(uploadStatus === "uploading" || uploadStatus === "done") && (
                        <div className="uploadProgressBar-wrapper">
                            <div className={`uploadProgressBar-shimmer ${uploadStatus === "done" ? "uploadProgressBar--done" : ""}`} />
                        </div>
                    )}

                    <div className="createPost-fields">
                        <textarea className="captionPost" value={captionPost}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Write caption..."
                            autoCorrect="off" autoComplete="off" autoCapitalize="none" />
                    </div>

                    <div className="createPost-fields">
                        <button type="submit" className="postButtonDesign"
                            disabled={!file || isUploading}>
                            {isUploading ? <span className="twine-upload-btn-spinner"></span> : 'Upload Post'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default PostCard;