import React, { useState, useEffect } from "react";
import { Heart, HeartPlus, HeartOff, SendHorizontal, UserLock, MessageCircleDashed, UserRoundPlus, Flame, UserRoundCheck, LayoutGrid, History, SquareUser, MapPin, Link2, BadgeCheck, BriefcaseBusiness, CalendarDays, Aperture } from "lucide-react";
import { useParams } from "react-router-dom";
import "../Assets/Bundle/Profile.css";
import HeaderArea from "./Header";
import FooterArea from "./Footer";
import NotFoundPage from "../ErrorHandler/ErrrorDesign/ErrorPageDesign";
import InternalErrorPage from "../ErrorHandler/ErrrorDesign/InternalErrorPageDesign";
import { followUserAPI, userProfilePageAPI } from "../utils/userProfileAPI";

function Profile() {

  // OnClick Active Visible Tab for Footer Feed, Timeline & Tagged..
  const [contentVisibleTab, setContentVisibleTab] = useState("FeedVisibleTab");

  // Profile User URL Fuctionality
  const { username } = useParams(); // get username from URL
  const [userProfileDataURL, setUserProfileDataURL] = useState(null); // Collect user data
  const [userProfileStatusURL, setUserProfileStatusURL] = useState("LoadingUserProfileURL");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfileData = await userProfilePageAPI(username);
        setUserProfileDataURL(userProfileData);
        setUserProfileStatusURL("FoundUserProfileURL");
      } catch (err) {
        if (err.message === "NotFoundUserProfileURL") {
          // User not found
          setUserProfileStatusURL("NotFoundUserProfileURL");
        } else {
          // Any other error
          setUserProfileStatusURL("ErrorUserProfileURL");
        }
      }
    };

    fetchProfile();
  }, [username]);


  // Store Follow Status
  const [followCheckStatus, setFollowCheckStatus] = useState(false);
  const [followRequestSentCheckStatus, setFollowRequestSentCheckStatus] = useState(false);
  const [followRequestReceiveCheckStatus, setFollowRequestReceiveCheckStatus] = useState(false);
  const [accountPrivateCheckStatus, setAccountPrivateCheckStatus] = useState(false);

  useEffect(() => {
    if (userProfileDataURL !== null) {
      setAccountPrivateCheckStatus(userProfileDataURL.searchPrivate);
      setFollowCheckStatus(userProfileDataURL.followingStatus);
      setFollowRequestSentCheckStatus(userProfileDataURL.followReqStatus);
      setFollowRequestReceiveCheckStatus(userProfileDataURL.followReqOptStatus);
    }
  }, [userProfileDataURL]);

  // Decide follow button state (UI logic)
  let actionType = null;

  if (userProfileDataURL && userProfileDataURL.searchLoggedUser === false) {
    if (followCheckStatus) {
      actionType = "UNFOLLOWBTN";
    } else if (accountPrivateCheckStatus && followRequestSentCheckStatus) {
      actionType = "REQUESTEDBTN";
    } else {
      actionType = "FOLLOWBTN";
    }
  }

  // Handle Follow Button
  const handleFollow = async (e) => {
    e.preventDefault();

    if (userProfileDataURL === null) {
      console.log("Error occured!");
      return;
    }

    const followData = {
      userUid: userProfileDataURL.searchUserId,
    }

    try {
      await followUserAPI(followData);
      const freshProfile = await userProfilePageAPI(username);
      setUserProfileDataURL(freshProfile);
      console.log("Follow Success");
    } catch (error) {
      console.log("Error occured!");
    }

  }

  // Handle Like Button 
  const handleSendLike = async (e) => {
    e.preventDefault();

  }

  // Render loading / notfound / error states
  if (userProfileStatusURL === "LoadingUserProfileURL") return <div className="loading">Loading profile...</div>;
  if (userProfileStatusURL === "NotFoundUserProfileURL") return <div className="error"><NotFoundPage /></div>;
  if (userProfileStatusURL === "ErrorUserProfileURL") return <div className="error"><InternalErrorPage /></div>;


  return (
    <>
      <div className="main-wrapper-profile">

        {/* Header Section*/}
        <HeaderArea />

        {/* Middle Main Wrapper */}
        <main className="middle-main-container">
          {/* Profile Middle Bar */}
          <div className="profileContent-Box">

            {/* Profile Header */}
            <div className="profileHeader-Box">
              {/* Profile Image Header Box */}
              <div className="profileImageHeader-Box">
                <div className="profileImagePFP-Box">
                  <img
                    src={
                      userProfileDataURL?.searchProfilePhoto &&
                        userProfileDataURL.searchProfilePhoto !== "null"
                        ? `http://localhost:8082/uploads/${userProfileDataURL.searchProfilePhoto}`
                        : `http://localhost:8082/uploads/defaultImage/Twine_DefaultNullImage.png`
                    }
                    className="profileMainImagePFP"
                    alt="profileImage"
                  />
                </div>
                <div className="profileNameInfo-Box">
                  <p className="profileFullNameInfoTag-Box">{userProfileDataURL.searchFullname}</p>
                  <p className="profileUserNameInfoTag-Box">@{userProfileDataURL.searchUsername} {userProfileDataURL.searchVerified === true && (
                    <BadgeCheck height="20" width="20" className="profileUsernameVerifyBadgeIcon-Box" />)}</p>
                </div>
              </div>
              {/* Profile Extra Data Info */}
              <div className="profileExtraData-Box">
                {userProfileDataURL?.searchBadge && (
                  <p className="profileExtraDataInfoPara-Box">
                    <BriefcaseBusiness height="12" width="12" className="dataUserIcons" /> {userProfileDataURL.searchBadge}
                  </p>
                )}
                {userProfileDataURL?.searchUserLocation && (
                  <p className="profileExtraDataInfoPara-Box">
                    <MapPin height="12" width="12" className="dataUserIcons" /> {userProfileDataURL.searchUserLocation}
                  </p>
                )}
                <p className="profileExtraDataInfoPara-Box">
                  <CalendarDays height="12" width="12" className="dataUserIcons" />
                  {userProfileDataURL?.searchCreatedAt
                    ? `Joined ${new Date(userProfileDataURL.searchCreatedAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric"
                    })}`
                    : ""}

                </p>
              </div>
              {/* Profile Bio Info */}
              {userProfileDataURL?.searchUserBio && (
                <div className="profileBioData-Box">
                  <p className="profileBioDataInfoPara-Box">
                    {userProfileDataURL.searchUserBio}
                  </p>
                </div>
              )}

              <div className="userFollowDataInfoPack">
                <p className="userFollowDataContentBox">{userProfileDataURL.followersCount} Followers</p>
                <p className="userFollowDataContentBox">{userProfileDataURL.postCount} Posts</p>
              </div>

              {/* Follow & Like Button */}
              {userProfileDataURL.searchLoggedUser === false && (
                <div className="profileActionContentBtn-Box">

                  {actionType === "UNFOLLOWBTN" && (
                    <button className="profileUnFollowActionBtns-Box" onClick={handleFollow}>
                      <UserRoundCheck size={20} className="profileActionBtnIconDesign" />
                      <span className="followActionButtonSpan">Unfollow</span>
                    </button>
                  )}

                  {actionType === "REQUESTEDBTN" && (
                    <button className="profileUnFollowActionBtns-Box" onClick={handleFollow}>
                      <UserRoundCheck size={20} className="profileActionBtnIconDesign" />
                      <span className="followActionButtonSpan">Requested</span>
                    </button>
                  )}

                  {actionType === "FOLLOWBTN" && (
                    <button className="profileFollowActionBtns-Box" onClick={handleFollow}>
                      <UserRoundPlus size={20} className="profileActionBtnIconDesign" />
                      <span className="followActionButtonSpan">
                        {userProfileDataURL.followerStatus === true ? (<>Follows you</>) : (<>Follow</>)}
                      </span>
                    </button>
                  )}

                  <button className="profileSendLikeActionBtns-Box" name="action" value="likeSend" onClick={handleSendLike}> <HeartPlus size={20} className="profileActionBtnIconDesign" />
                    <span>Send a like</span>
                  </button>

                </div>)}
            </div>

            {userProfileDataURL.searchPrivateShow === true ? (<>
              {/* Profile Middle Tab Box */}
              <div className="profileMiddle-Box">
                <div className="profileTabBarMidIconDesign-Box"><button type="button" className="profileContenttabBtnIconDesign" onClick={() => setContentVisibleTab("FeedVisibleTab")}><LayoutGrid size={23} className="tabIconsBox-MidProfile" /></button></div>
                <div className="profileTabBarMidIconDesign-Box"><button type="button" className="profileContenttabBtnIconDesign" onClick={() => setContentVisibleTab("TimeLineVisibleTab")}><History size={23} className="tabIconsBox-MidProfile" /></button></div>
                <div className="profileTabBarMidIconDesign-Box"><button type="button" className="profileContenttabBtnIconDesign" onClick={() => setContentVisibleTab("TaggedVisibleTab")}><SquareUser size={23} className="tabIconsBox-MidProfile" /></button></div>
              </div>

              {/* Profile footer */}
              <div className="profileFooter-Box">

                {/* Feed Section */}
                {contentVisibleTab === "FeedVisibleTab" && (
                  <div className="contentSectionDesignFeed-Box">
                    {userProfileDataURL.userPosts && userProfileDataURL.userPosts.length > 0 ? (
                      userProfileDataURL.userPosts.map((post) => (
                        <div key={post.fetchPostId} className="profilePostCard-Box">
                          {/* Post - Header */}
                          <div className="profilePostHeaderMain-Box">
                            <div className="profilePostHeaderPFPImage-Box">
                              <img
                                src={
                                  userProfileDataURL?.searchProfilePhoto &&
                                    userProfileDataURL.searchProfilePhoto !== "null"
                                    ? `http://localhost:8082/uploads/${userProfileDataURL.searchProfilePhoto}`
                                    : `http://localhost:8082/uploads/defaultImage/Twine_DefaultNullImage.png`
                                }
                                className="profilePostHeaderPFP-Box"
                                alt="profileImage"
                              />
                            </div>
                            <div className="profilePostHeaderUsernameText-box">
                              <span className="profilePostHeaderUserText-Box">{userProfileDataURL.searchUsername}</span>
                              {post.fetchVerified === true && (
                                <span className="profilePostVerifyBadgeIcon-Box"><BadgeCheck height="20" width="20" className="profilePostUsernameVerifyBadgeIcon-Box" /></span>
                              )}
                            </div>
                          </div>
                          {/* Post - Caption */}
                          {post?.fetchPostCaption && (
                            <div className="profilePostCaptionMain-Box">
                              <p className="profilePostCaptionText-Box">
                                {post.fetchPostCaption}
                              </p>
                            </div>
                          )}
                          {/* Post - Main Content */}
                          <div className="profilePostMainContentMedia-Box">
                            <div className="postMainContentMiddleBox" style={{
                              paddingBottom: post.width && post.height
                                ? `${(post.height / post.width) * 100}%`
                                : '100%'   // default square jab width/height null ho
                            }}>

                              {post.postType === 'VIDEO' ? (
                                <video
                                  src={`http://localhost:8082/uploads/${post.fetchFileName}`}
                                  className="profilePostContentView-Box"
                                  style={{ position: 'absolute', top: 0, left: 0 }}
                                  controls
                                  playsInline
                                />
                              ) : (
                                <img
                                  src={`http://localhost:8082/uploads/${post.fetchFileName}`}
                                  alt="Post Media"
                                  className="profilePostContentView-Box"
                                  style={{ position: 'absolute', top: 0, left: 0 }}
                                />
                              )}

                            </div>
                          </div>
                          {/* Post Action Buttons */}
                          <div className="postBottomAction">
                            {/* Like Buttons */}
                            <div className="action-toogles">
                              <div className="postAction-Icons"><button type="button" className="postActionContentBtn-ToogleBox" ><Heart size={23} className="bottomAction-icons" /></button></div>
                              <div className="postAction-Icons"><button type="button" className="postActionContentBtn-ToogleBox" ><Flame size={23} className="bottomAction-icons" /></button></div>
                              <div className="postAction-Icons"><button type="button" className="postActionContentBtn-ToogleBox" ><MessageCircleDashed size={23} className="bottomAction-icons" /></button></div>
                            </div>
                            {/* Comments Section */}
                            {post.commentEnable === true ? (<div className="action-toogles">
                              <div className="commentPost-Box">
                                <input type="text" name="commentPost" className="commentPost-field" placeholder="Drop a comment" autoCapitalize="none" autoComplete="off" autoCorrect="off" />
                                <button type="button" className="commentIcon-box">
                                  <SendHorizontal size={23} className="comment-icon" />
                                </button>
                              </div>
                            </div>) : (<></>)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="errorCheckNoPost-Box">
                        <div className="errorCheckNoPostWrapper-Box">
                          <div className="errorCheckIconPost-Box">
                            <Aperture height="24" width="24" className="errorCheckIconNoPost" />
                          </div>
                          <p className="errorCheckTextNoPost-Box">No Post Yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}



                {/* TimeLine Section */}
                {contentVisibleTab === "TimeLineVisibleTab" && (
                  <div className="contentSectionDesignTimeline-Box">
                    {userProfileDataURL.searchUserTimeline ? (
                      <div className="timelineConectionContentMainBox">
                        {userProfileDataURL.searchUserTimeline && userProfileDataURL.searchUserTimeline !== null && userProfileDataURL.searchUserTimeline !== "" ? (
                          <div className="connectionTimelineHeaderBar-Box">
                            <span className="spanTimelineHeaderBox">Sharing a connection with <span className="usernameTimelineBoxHiighlight"> {userProfileDataURL.searchUserTimeline}</span></span>
                          </div>
                        ) : (<></>)}
                        <div>
                          <div className="connectionTimelinePostHeaderBox"><span className="spanTimeLinePostHeaderTextBox">Timeline Photos and Videos</span></div>
                          <div className="connectionTimelinePostListBox">
                            <div className="connectionTimelinePostContainerBox grid-3x3">
                              {userProfileDataURL.timelinePosts &&
                                userProfileDataURL.timelinePosts.length > 0 ? (

                                userProfileDataURL.timelinePosts.map((post, index) => (
                                  <div key={index} className="grid-item">
                                    <img
                                      src={`http://localhost:8082/uploads/${post.fetchFileName}`}
                                      alt="post"
                                      className="gridImagesList"
                                    />
                                  </div>

                                ))

                              ) : (
                                <div className="timelineNoPostMsgBox">
                                  <p className="timelineErrorMsgNoPost">
                                    <span>No Uploads</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="errorCheckNoTimeline-Box">
                          <div className="errorCheckNoTimelineWrapper-Box">
                            <div className="errorCheckIconTimeline-Box">
                              <HeartOff height="24" width="24" className="errorCheckIconNoTimeline" />
                            </div>
                            <p className="errorCheckTextTimeline-Box">No Connection Yet</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tagged Section */}
                {contentVisibleTab === "TaggedVisibleTab" && (
                  <div className="contentSectionDesignTagged-Box">

                  </div>
                )}

              </div>
            </>) : (
              <>
                <div className="AccountPrivateContentMsgBox">
                  <div className="AccountPrivateDilaugeBox">
                    <div className="LockedAccountIconBox">
                      <UserLock height="24" width="24" className="LockedAccountIconContentBox" />
                    </div>
                    <p className="LockedAccountSpanMsgBox"><span>Locked Account</span></p>
                  </div>
                  <div className="contextMsgBox">
                    <p className="contextMsgBoxParagraphText">
                      <span>
                        You can't see posts and stories unless you follow them.
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}



          </div>
        </main>


        {/* Footer Section */}
        <FooterArea />
      </div>
    </>
  );
}

export default Profile;