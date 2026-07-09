import React, { useState, useEffect, useRef } from "react";
import { Image, Heart, Tag, MapPin } from "lucide-react";
import "./PostCard.css";
import "../../../Assets/Bundle/GlobalSpinner.css";
import { uploadPostAPI } from "../../../Utils/PostFeaturesAPI.js";
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

    useEffect(() => {
        return () => preview && URL.revokeObjectURL(preview);
    }, [preview]);

    if (!loggedUserData) return <PostCardSkeleton />;

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

    const postLive = async (e) => {
        e.preventDefault();

        // 1. Guard: double submit prevent
        if (uploadingRef.current) return;

        // 2. Validations
        if (!file) { setError("Please select an image or video!"); return; }
        if (captionPost.length > 1000) { setError("Caption too long! (1000 limit)"); return; }
        if (file.size > MAX_SIZE) { setError("File too large! (500 MB limit)"); return; }

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

        // 5. API Call
        try {
            await uploadPostAPI(formData);

            // 6. Success: reset form + show success
            setFile(null);
            setPreview(null);
            setCaption("");
            setTimeLineUserPost(0);
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
        <div className="slide-bar-wrapper">
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
                        <p className="bio-tagbox">@{loggedUserData?.userName}</p>
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
                                <button type="button" className="postBtnAsIconToogle-Box">
                                    <Tag size={21} className="iconPost" />
                                </button>
                            </div>
                        </div>

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
        </div>
    );
}

export default PostCard;