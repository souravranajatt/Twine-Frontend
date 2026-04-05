// Main.js
import React, { useState, useEffect, useRef } from "react";
import { Image, Heart, Tag, MessageCircleDashed, MapPin, SendHorizontal, Flame} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Assets/Bundle/Main.css";
import HeaderArea from "./Header";
import FooterArea from "./Footer";
import postHeaderImage from "./img/postheader.jpg";
import postContent from "./img/post.jpg";
import { uploadPostAPI, loggedUserDataAPI } from "../utils/userProfileAPI";

function Main() {

  // Define Navigate Variable
  const navigate = useNavigate();
  const [loggedUserData, setLoggedUserData] = useState(null);

  useEffect(() => {
    const fetchLoggedData = async () => {
      try{
        const res = await loggedUserDataAPI();
        setLoggedUserData(res);
      }catch(err){
        // cookie deleted / JWT invalid
        setLoggedUserData(null); // clear state
        console.log("Failed to load data or Something went wrong!");
        //navigate("/login", { replace: true }); // redirect once
      }
    };

    fetchLoggedData();
  }, []);

  // Post && File Select through devices
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [captionPost, setCaption] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLineUserPost, setTimeLineUserPost] = useState(0);

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
    const validTypes = ["image/jpeg","image/heic","image/png","image/jpg","video/mp4","video/quicktime","video/mov"];
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
    if(timeLineUserPost === 0){
      setTimeLineUserPost(1);
    }else{
      setTimeLineUserPost(0);
    }
  }

  const MAX_SIZE = 500 * 1024 * 1024;
  // Post Live Handler
  const postLive = async (e) => {
    e.preventDefault();

    if(loggedUserData === null){
      console.log("Error occured!");
      return;
    }

    // check file selection
    if (!file) {
      setError("Please select an image or video!");
      return;
    }

    if(captionPost.length > 250){
      setError("Caption size is to long!");
      return;
    }

    if(file.size > MAX_SIZE){
      setError("File size is to long!");
      return;
    }

    // create form data
    const formData = new FormData();
    formData.append("postCaption", captionPost);
    formData.append("file", file);
    if(timeLineUserPost === 1){
      formData.append("postTimelineUser", timeLineUserPost);
    }

    try{
      const res = await uploadPostAPI(formData);
      setFile(null);
      setPreview(null);
      setCaption("");
      setError("");
      setSuccess("Post Uploaded!");
      setTimeLineUserPost(0);
      setTimeout(() => setSuccess(""), 5000);
    }catch (err){
      setError(err.message || err);
    }

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
                    ? `http://localhost:8082/uploads/${loggedUserData.profilePhoto}`
                    : `http://localhost:8082/uploads/defaultImage/Twine_DefaultNullImage.png`
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
                  <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="postFile"/>
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
                    <img src={preview} className="previewPost" alt="Preview"/>
                      ) : (
                    <video src={preview} className="previewPost" controls/>
                  )}
                </div> 
                )}
                {error && <p className="errorPost">{error}</p>}
                {success && <p className="successPost">{success}</p>}
                <div className="createPost-fields">
                  <textarea type="text" className="captionPost" value={captionPost} onChange={(e) => setCaption(e.target.value)} placeholder="Write caption..." autoCorrect="off" autoComplete="off" autoCapitalize="none"></textarea>
                </div>
                <div className="createPost-fields">
                  <button type="submit" className="postButtonDesign" disabled={!file}>Upload Post</button>
                </div>
              </form>
            </div>
          </div>
        </div>


                    {/* -------------------------------------------- */}

        
        {/* Feed Section */}
        <div className="feed-wrapper content-post">
          {/* Each Feed Box */}
          <div className="feed-post-box">
            {/* Post - Header */}
            <div className="post-header">
              <div className="postHeaderImageMainFeed">
                <img src={postHeaderImage} className="imageFeedPostMainHeader" alt="user-profile"></img>
              </div>
              <div className="post-header-userText">
                <span className="username-title">twine.ceo</span>
              </div>
            </div>
            {/* Post - Caption */}
            <div className="post-caption-wrapper">
              <p className="caption-paraHead">
                "Don't count the days, make the days count"
              </p>
            </div>
            {/* Post - Main Content */}
            <div className="postFeedMainContent">
              <div className="postMainFeedContentMiddleBox">
                <img src={postContent} alt="post-image" className="mainContentMediaImage"/>
              </div>
            </div>
            {/* Post Action Buttons */}
            <div className="postBottomAction">
              {/* Like Buttons */ }
              <div className="action-toogles">
                <div className="postAction-Icons"><button type="button" className="postActionContentBtn-ToogleBox" ><Heart size={23}  className="bottomAction-icons"/></button></div>
                <div className="postAction-Icons"><button type="button" className="postActionContentBtn-ToogleBox" ><Flame size={23}  className="bottomAction-icons"/></button></div>
                <div className="postAction-Icons"><button type="button" className="postActionContentBtn-ToogleBox" ><MessageCircleDashed size={23} className="bottomAction-icons"/></button></div>
              </div>
              {/* Comments Section */}
              <form className="action-toogles">
                {/* Comment-Box */}
                <div className="commentPost-Box">
                  <input type="text" name="commentPost" className="commentPost-field" placeholder="Drop a comment" autoCapitalize="none" autoComplete="off" autoCorrect="off"/>
                  <button type="button" className="commentIcon-box">
                    <SendHorizontal size={23} className="comment-icon"/>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </main>

      {/* footer-section */}
        <FooterArea /> 

    </div>
  </>
  );
}

export default Main;
