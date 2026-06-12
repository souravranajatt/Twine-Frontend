// Main.js
import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import { BadgeCheck, Image, Heart, Tag, Forward, MapPin, SendHorizontal, Loader2, MessageCircle } from "lucide-react";
import "../Assets/Bundle/Main.css";
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import { uploadPostAPI } from "../Utils/PostUploadAPI.js";
import formatPostTime from "../Lib/formatPostTime.js";
import renderFormattedCaption from "../Lib/renderFormattedCaption.js";
import { homeFeedFetch, loggedUserDataAPI } from "../Utils/homePageAPI.js";

function Main() {

  const [loggedUserData, setLoggedUserData] = useState(null);
  const MAX_SIZE = 500 * 1024 * 1024; // Max File Size

  // For Fecthing User Logged Data..
  useEffect(() => {
    const fetchLoggedData = async () => {
      try {
        const res = await loggedUserDataAPI();
        setLoggedUserData(res);
      } catch (err) {
        // cookie deleted / JWT invalid
        setLoggedUserData(null); // clear state
        console.log("Failed to load data or Something went wrong!");
        //navigate("/login", { replace: true }); // redirect once
      }
    };

    fetchLoggedData();
  }, []);

  // --------------- Feed Pagination / Infinite Scroll State ---------------
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Expanded Captions State
  const [expandedCaptions, setExpandedCaptions] = useState({});

  const toggleCaption = (postId) => {
    setExpandedCaptions((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // UseEffect for Fetching Posts on Page change
  useEffect(() => {
    const fetchFeed = async () => {
      // Agar backend se loading ruki hui hai yah sara data aa gya toh process na kre!
      if (!hasMore) return;

      setLoadingPosts(true);
      try {
        const data = await homeFeedFetch(page);

        // Yeh condition depend karegi aapke backend ke response pe. (e.g. data is array and empty means no more posts)
        if (data.length === 0) {
          setHasMore(false);
        } else {
          // Pichle posts me naya data append kro, but duplicates hata do (React Strict Mode fix)
          setPosts((prevPosts) => {
            const existingIds = new Set(prevPosts.map((p) => p.fetchPostId));
            const newPosts = data.filter((p) => !existingIds.has(p.fetchPostId));
            return [...prevPosts, ...newPosts];
          });
        }
      } catch (err) {
        console.log("Error loading feed items!", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchFeed();
  }, [page, hasMore]);

  // Scroll Event Listener for detection bottom of the page
  useEffect(() => {
    const handleScroll = () => {
      // Agar user screen k ek dum bottom se 100px upr bhi poch jaye toh trigger ho 
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.scrollHeight
      ) {
        if (!loadingPosts && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingPosts, hasMore]);
  // ---------------------------------------------------------------------


  // Post && File Select through devices
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [captionPost, setCaption] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLineUserPost, setTimeLineUserPost] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Input File Click Handle
  const fileInputRef = useRef(null);
  const inputFileClick = (e) => {
    fileInputRef.current.click();
  }

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFileChange = (e) => {
    // Store File in a varialbe 
    const selectedFile = e.target.files[0];
    // Check File is selected or not !
    if (!selectedFile) return;
    // Check File Type
    const validTypes = ["image/jpeg", "image/heic", "image/png", "image/jpg", "video/mp4", "video/quicktime", "video/mov"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only image or video file are allowed!");
      setFile(null);
      setPreview(null);
      setSuccess("");
      return;
    }
    // Valid file — set preview
    setError("");
    setSuccess("");
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));

  };

  // Select timeline user 
  const timeLineSelectClick = () => {
    if (timeLineUserPost === 0) {
      setTimeLineUserPost(1);
    } else {
      setTimeLineUserPost(0);
    }
  }


  // Post Live Handler
  const postLive = async (e) => {
    e.preventDefault();

    if (loggedUserData === null) {
      console.log("Error occured!");
      return;
    }

    // check file selection
    if (!file) {
      setError("Please select an image or video!");
      return;
    }

    if (captionPost.length > 1000) {
      setError("Caption size is to long! (1000 Characters Limit)");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("File size is to long! (500 MB Limit)");
      return;
    }

    // create form data
    const formData = new FormData();
    formData.append("postCaption", captionPost);
    formData.append("file", file);
    if (timeLineUserPost === 1) {
      formData.append("postTimelineUser", timeLineUserPost);
    }

    try {
      setIsUploading(true);
      setError("");
      setSuccess("");
      await uploadPostAPI(formData);
      setFile(null);
      setPreview(null);
      setCaption("");
      setError("");
      setSuccess("Post Uploaded!");
      setTimeLineUserPost(0);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message || err);
    } finally {
      setIsUploading(false);
    }

  };

  // Like/Unlike
  const handleLike = async (postId) => {
    console.log(postId);
  };

  return (
    <>
      <div className="home-main-container">


        {/* Header */}
        <HeaderArea />



        {/* Main Feed */}
        <main className="main-wrapper">

          {/* Side - Bar Section */}
          <div className="slide-bar-wrapper">
            {/* Profile and Post Upload Box Section */}
            <div className="side-bar-box">
              {/* Profile Card */}
              <div className="profile-card-box">
                <div className="sideProfilePicHeader">
                  <img
                    src={
                      loggedUserData?.profilePhoto &&
                        loggedUserData.profilePhoto !== "null"
                        ? `${loggedUserData.profilePhoto}`
                        : `https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png`
                    }
                    alt="profileImage"
                    className="sidePhotoImageBox" />
                </div>
                <div className="side-info-box">
                  <p className="fullname-tagbox">{loggedUserData?.fullName}</p>
                  <p className="bio-tagbox">@{loggedUserData?.userName}</p>
                </div>
              </div>
              {/* Upload post Card */}
              <div className="createPost-card-box">
                <p className="createPost-header">Create Post</p>
                <form className="post-form" onSubmit={postLive}>
                  <div className="createPost-fields">
                    <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="postFile" />
                    <div className="postIconBtn-Design"><button type="button" className="postBtnAsIconToogle-Box" onClick={inputFileClick}><Image size={21} className="iconPost" /></button></div>
                    {loggedUserData?.uTimeline && (
                      <div className="postIconBtn-Design">
                        <button type="button" className="postBtnAsIconToogle-Box" onClick={timeLineSelectClick}>
                          {timeLineUserPost === 1 ? (<Heart size={21} className="iconPostTimelineChange" />) : (<Heart size={21} className="iconPost" />)}
                        </button>
                      </div>
                    )}
                    <div className="postIconBtn-Design"><button type="button" className="postBtnAsIconToogle-Box"><MapPin size={21} className="iconPost" /></button></div>
                    <div className="postIconBtn-Design"><button type="button" className="postBtnAsIconToogle-Box"><Tag size={21} className="iconPost" /></button></div>
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
                  <div className="createPost-fields">
                    <textarea type="text" className="captionPost" value={captionPost} onChange={(e) => setCaption(e.target.value)} placeholder="Write caption..." autoCorrect="off" autoComplete="off" autoCapitalize="none"></textarea>
                  </div>
                  <div className="createPost-fields">
                    <button type="submit" className="postButtonDesign" disabled={!file || isUploading}>
                      {isUploading ? 'Uploading...' : 'Upload Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>


          {/* -------------------------------------------- */}


          {/* Feed Section */}
          <div className="feed-wrapper content-post">
            {posts.map((post) => (
              <div className="feed-post-box" key={post.fetchPostId}>

                {/* Post - Header */}
                <div className="post-header">
                  <div className="postHeaderImageMainFeed">
                    <img
                      src={
                        post.profileImage && post.profileImage !== "null"
                          ? `${post.profileImage}`
                          : `https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png`
                      }
                      className="imageFeedPostMainHeader"
                      alt="user-profile"
                    />
                  </div>

                  <div className="post-header-userText">
                    <div className="post-header-userTextBox">
                      <span className="username-title">
                        <Link to={`/${post.username}`} className="userLinkTextStyle">{post.username}</Link>
                      </span>
                      {post.fetchVerified === true && (
                        <BadgeCheck height="19" width="19" className="profilePostUsernameVerifyBadgeIcon-Box" />
                      )}
                      {post.fetchUploadAt && (
                        <span className="profilePostTimeText">• {formatPostTime(post.fetchUploadAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post - Main Content */}
                <div className="postFeedMainContent">
                  <div className="postMainFeedContentMiddleBox" style={{
                    paddingBottom: post.width && post.height
                      ? `${(post.height / post.width) * 100}%`
                      : '100%'
                  }}>

                    {post.postType === 'VIDEO' ? (
                      <video
                        src={post.fetchFileName}
                        className="mainContentMediaBox video-post"
                        controls
                        playsInline
                      />
                    ) : (
                      <img
                        src={post.fetchFileName}
                        alt="post-content"
                        className="mainContentMediaBox image-post"
                      />
                    )}
                  </div>
                </div>

                {/* Post - Caption */}
                {post?.fetchPostCaption && (
                  <div className="post-caption-wrapper">
                    <p className="caption-paraHead">
                      {renderFormattedCaption(
                        post.fetchPostCaption,
                        post.fetchPostId,
                        expandedCaptions[post.fetchPostId],
                        toggleCaption,
                        post.fetchPostCaption.length
                      )}
                    </p>
                  </div>
                )}

                {/* Location & Tagged Users metadata at the bottom */}
                {(post.fetchPostLocation || (post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0)) && (
                  <div className="postMetaInfoRow">
                    {post.fetchPostLocation && (
                      <span className="postMetaLocation">
                        {post.fetchPostLocation}
                      </span>
                    )}
                    {post.fetchPostLocation && post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0 && (
                      <span className="metaDivider">•</span>
                    )}
                    {post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0 && (
                      <div className="postMetaTagged-Box">
                        <span className="taggedUserLabel">With </span>
                        {post.fetchTaggedUsers.map((taggedUser) => (
                          <span key={taggedUser} className="taggedUserPill">@{taggedUser}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}


                {/* Post Action Buttons */}
                <div className="postBottomAction">
                  <div className="action-toogles">

                    <div className="postAction-Icons">
                      <button type="button" className="postActionContentBtn-ToogleBox" onClick={() => handleLike(post.fetchPostId)}>
                        <Heart size={23} className="bottomAction-icons"
                          fill={post.likedByCurrentUser ? "#ff3b6c" : "none"}
                          color={post.likedByCurrentUser ? "#ff3b6c" : "currentColor"}
                        />
                        {post.likeHide !== false && (
                          <span className="postActionCountText" style={{ color: "#1c1c1e" }}>
                            {post.likeCount || 0}
                          </span>
                        )}
                      </button>
                    </div>

                    {post.commentEnable === true && (
                      <div className="postAction-Icons">
                        <button type="button" className="postActionContentBtn-ToogleBox">
                          <MessageCircle size={23} className="bottomAction-icons" />
                          <span className="postActionCountText">
                            {post.commentCount || 0}
                          </span>
                        </button>
                      </div>
                    )}

                    {post.shareEnable === true && (
                      <div className="postAction-Icons shareIconRight">
                        <button type="button" className="postActionContentBtn-ToogleBox">
                          <Forward size={23} className="bottomAction-icons" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comments Section */}
                  {post.commentEnable === true && (
                    <div className="action-toogles commentFormToggleBox">
                      <form className="commentPost-Box">
                        <input
                          type="text"
                          name="commentPost"
                          className="commentPost-field"
                          placeholder="Drop a comment..."
                          autoCapitalize="none"
                          autoComplete="off"
                          autoCorrect="off"
                        />
                        <button type="submit" className="commentIcon-box">
                          <SendHorizontal size={18} className="comment-icon" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            ))}
            {loadingPosts && (
              <div className="feed-loading-spinner-box">
                <Loader2 size={30} className="spinner-icon" />
              </div>
            )}
          </div>

        </main>

        {/* footer-section */}
        <FooterArea />

      </div>
    </>
  );
}

export default Main;
