import React, { useState, useEffect, useCallback } from "react";
import useInfiniteScroll from "../Lib/useInfiniteScroll.js";
import { Heart, HeartPlus, HeartOff, SendHorizontal, UserLock, MessageCircleDashed, UserRoundPlus, Flame, UserRoundCheck, LayoutGrid, History, SquareUser, MapPin, Link2, BadgeCheck, BriefcaseBusiness, CalendarDays, Aperture, Loader2, CircleUser, Play } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "../Assets/Bundle/Profile.css";
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import NotFoundPage from "../ErrorHandler/ErrrorDesign/ErrorPageDesign";
import InternalErrorPage from "../ErrorHandler/ErrrorDesign/InternalErrorPageDesign";
import { followUserAPI, userProfilePageAPI, searchUserPostsAPI, searchUserTaggedPostsAPI, searchUserTimelinePostsAPI } from "../utils/userProfileAPI.js";
import { formatPostTime } from "../Lib/formatPostTime.js";

function Profile() {

  const { username, tab } = useParams(); // get username and tab from URL ..
  const navigate = useNavigate();

  // OnClick Active Visible Tab for Footer Feed, Timeline & Tagged..
  const [contentVisibleTab, setContentVisibleTab] = useState(() => {
    if (tab === "timeline") return "TimeLineVisibleTab";
    if (tab === "tagged") return "TaggedVisibleTab";
    return "FeedVisibleTab";
  });

  // Sync state if URL changes directly
  useEffect(() => {
    if (tab === "timeline") {
      setContentVisibleTab("TimeLineVisibleTab");
    } else if (tab === "tagged") {
      setContentVisibleTab("TaggedVisibleTab");
    } else {
      setContentVisibleTab("FeedVisibleTab");
    }
  }, [tab]);

  const handleTabClick = (newTab) => {
    if (newTab === "FeedVisibleTab") {
      navigate(`/${username}/posts`, { replace: true });
    } else if (newTab === "TimeLineVisibleTab") {
      navigate(`/${username}/timeline`, { replace: true });
    } else if (newTab === "TaggedVisibleTab") {
      navigate(`/${username}/tagged`, { replace: true });
    }
  };

  // Expanded Captions State
  const [expandedCaptions, setExpandedCaptions] = useState({});

  const toggleCaption = (postId) => {
    setExpandedCaptions((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };


  // Profile User URL Fuctionality
  const [userProfileDataURL, setUserProfileDataURL] = useState(null); // Collect user data
  const [userProfileStatusURL, setUserProfileStatusURL] = useState("LoadingUserProfileURL");

  // --------------- FEED POSTS ---------------
  const [profilePosts, setProfilePosts] = useState([]);
  const [postPage, setPostPage] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // ---------------- TIMELINE POSTS ----------------
  const [timelinePosts, setTimelinePosts] = useState([]);
  const [timelinePage, setTimelinePage] = useState(0);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [hasMoreTimeline, setHasMoreTimeline] = useState(true);

  // ---------------- TAGGED POSTS ----------------
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [taggedPage, setTaggedPage] = useState(0);
  const [loadingTagged, setLoadingTagged] = useState(false);
  const [hasMoreTagged, setHasMoreTagged] = useState(true);

  // Initial Load — Fetch Profile + First Page Posts
  useEffect(() => {
    const fetchInitialData = async () => {
      // Reset posts state on username change
      setProfilePosts([]);
      setPostPage(0);
      setHasMorePosts(true);

      // Reset timeline state on username change
      setTimelinePosts([]);
      setTimelinePage(0);
      setHasMoreTimeline(true);

      // Reset tagged state on username change
      setTaggedPosts([]);
      setTaggedPage(0);
      setHasMoreTagged(true);

      try {
        const profileData = await userProfilePageAPI(username);
        setUserProfileDataURL(profileData);
        setUserProfileStatusURL("FoundUserProfileURL");

        // Fetch first page of posts only if profile is accessible
        if (profileData.searchPrivateShow === true) {
          try {
            const postsData = await searchUserPostsAPI(username, 0);
            if (!postsData || postsData.length === 0) {
              setHasMorePosts(false);
            } else {
              setProfilePosts(postsData);
            }
          } catch (postErr) {
            console.log("Error loading profile posts!", postErr);
          }

          // Fetch first page of timeline posts (if connection exists)
          if (profileData.searchUserTimeline) {
            try {
              const timelineData = await searchUserTimelinePostsAPI(username, 0);
              if (!timelineData || timelineData.length === 0) {
                setHasMoreTimeline(false);
              } else {
                setTimelinePosts(timelineData);
              }
            } catch (timelineErr) {
              console.log("Error loading timeline posts!", timelineErr);
            }
          }

          // Fetch first page of tagged posts
          try {
            const taggedData = await searchUserTaggedPostsAPI(username, 0);
            if (!taggedData || taggedData.length === 0) {
              setHasMoreTagged(false);
            } else {
              setTaggedPosts(taggedData);
            }
          } catch (taggedErr) {
            console.log("Error loading tagged posts!", taggedErr);
          }
        }
      } catch (err) {
        if (err.message === "NotFoundUserProfileURL") {
          setUserProfileStatusURL("NotFoundUserProfileURL");
        } else {
          setUserProfileStatusURL("ErrorUserProfileURL");
        }
      }
    };

    fetchInitialData();
  }, [username]);

  // Pagination — Fetch page 1, 2, 3... (page 0 already loaded above)
  useEffect(() => {
    if (postPage === 0) return;

    const fetchMorePosts = async () => {
      setLoadingPosts(true);
      try {
        const data = await searchUserPostsAPI(username, postPage);

        if (!data || data.length === 0) {
          setHasMorePosts(false);
        } else {
          setProfilePosts((prevPosts) => {
            const existingIds = new Set(prevPosts.map((p) => p.fetchPostId));
            const newPosts = data.filter((p) => !existingIds.has(p.fetchPostId));
            return [...prevPosts, ...newPosts];
          });
        }
      } catch (err) {
        console.log("Error loading more posts!", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchMorePosts();
  }, [username, postPage]);

  // Infinite Scroll for Profile Posts
  useInfiniteScroll({
    loading: loadingPosts,
    hasMore: hasMorePosts,
    onLoadMore: useCallback(() => setPostPage((prev) => prev + 1), []),
    activeTab: contentVisibleTab,
    tabName: "FeedVisibleTab",
  });


  // -------------- TIMELINE POSTS (Lazy Load on Tab Open) --------------

  // Initial Timeline Fetch — runs when Timeline tab is first opened
  useEffect(() => {
    if (contentVisibleTab !== "TimeLineVisibleTab") return;
    if (timelinePosts.length > 0 || !hasMoreTimeline) return;
    if (!userProfileDataURL?.searchPrivateShow || !userProfileDataURL?.searchUserTimeline) return;

    const fetchInitialTimeline = async () => {
      setLoadingTimeline(true);
      try {
        const data = await searchUserTimelinePostsAPI(username, 0);
        if (!data || data.length === 0) {
          setHasMoreTimeline(false);
        } else {
          setTimelinePosts(data);
        }
      } catch (err) {
        console.log("Error loading timeline posts!", err);
      } finally {
        setLoadingTimeline(false);
      }
    };

    fetchInitialTimeline();
  }, [contentVisibleTab, username, userProfileDataURL]);

  // Timeline Pagination — Fetch page 1, 2, 3...
  useEffect(() => {
    if (timelinePage === 0) return;

    const fetchMoreTimeline = async () => {
      setLoadingTimeline(true);
      try {
        const data = await searchUserTimelinePostsAPI(username, timelinePage);
        if (!data || data.length === 0) {
          setHasMoreTimeline(false);
        } else {
          setTimelinePosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.fetchPostId));
            const newPosts = data.filter((p) => !existingIds.has(p.fetchPostId));
            return [...prev, ...newPosts];
          });
        }
      } catch (err) {
        console.log("Error loading more timeline posts!", err);
      } finally {
        setLoadingTimeline(false);
      }
    };

    fetchMoreTimeline();
  }, [username, timelinePage]);

  // Infinite Scroll for Timeline Posts
  useInfiniteScroll({
    loading: loadingTimeline,
    hasMore: hasMoreTimeline,
    onLoadMore: useCallback(() => setTimelinePage((prev) => prev + 1), []),
    activeTab: contentVisibleTab,
    tabName: "TimeLineVisibleTab",
  });


  // -------------- TAGGED POSTS --------------

  // Tagged Pagination — Fetch page 1, 2, 3...
  useEffect(() => {
    if (taggedPage === 0) return;

    const fetchMoreTagged = async () => {
      setLoadingTagged(true);
      try {
        const data = await searchUserTaggedPostsAPI(username, taggedPage);
        if (!data || data.length === 0) {
          setHasMoreTagged(false);
        } else {
          setTaggedPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.fetchPostId));
            const newPosts = data.filter((p) => !existingIds.has(p.fetchPostId));
            return [...prev, ...newPosts];
          });
        }
      } catch (err) {
        console.log("Error loading more tagged posts!", err);
      } finally {
        setLoadingTagged(false);
      }
    };

    fetchMoreTagged();
  }, [username, taggedPage]);

  // Infinite Scroll for Tagged Posts
  useInfiniteScroll({
    loading: loadingTagged,
    hasMore: hasMoreTagged,
    onLoadMore: useCallback(() => setTaggedPage((prev) => prev + 1), []),
    activeTab: contentVisibleTab,
    tabName: "TaggedVisibleTab",
  });


  // Store Follow State
  const [followCheckStatus, setFollowCheckStatus] = useState(false);
  const [followRequestSentCheckStatus, setFollowRequestSentCheckStatus] = useState(false);
  const [followRequestReceiveCheckStatus, setFollowRequestReceiveCheckStatus] = useState(false);
  const [accountPrivateCheckStatus, setAccountPrivateCheckStatus] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

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
      setIsFollowing(true);
      await followUserAPI(followData);
      const freshProfile = await userProfilePageAPI(username);
      setUserProfileDataURL(freshProfile);
      console.log("Follow Success");
    } catch (error) {
      console.log("Error occured!");
    } finally {
      setIsFollowing(false);
    }

  }

  // Handle Like Button 
  const handleSendLike = async (e) => {
    e.preventDefault();

  }

  // Render loading states with full page loader
  if (userProfileStatusURL === "LoadingUserProfileURL") {
    return (
      <div className="fullPageLoader-Box">
        <Loader2 size={40} className="spinner-icon" />
        <p className="loading-text-spinner">Loading...</p>
      </div>
    );
  }

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
                        ? `${userProfileDataURL.searchProfilePhoto}`
                        : `https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png`
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
                    <button className="profileUnFollowActionBtns-Box" onClick={handleFollow} disabled={isFollowing}>
                      {isFollowing ? <Loader2 size={20} className="profileActionBtnIconDesign spinner-icon" /> : <UserRoundCheck size={20} className="profileActionBtnIconDesign" />}
                      <span className="followActionButtonSpan">Unfollow</span>
                    </button>
                  )}

                  {actionType === "REQUESTEDBTN" && (
                    <button className="profileUnFollowActionBtns-Box" onClick={handleFollow} disabled={isFollowing}>
                      {isFollowing ? <Loader2 size={20} className="profileActionBtnIconDesign spinner-icon" /> : <UserRoundCheck size={20} className="profileActionBtnIconDesign" />}
                      <span className="followActionButtonSpan">Requested</span>
                    </button>
                  )}

                  {actionType === "FOLLOWBTN" && (
                    <button className="profileFollowActionBtns-Box" onClick={handleFollow} disabled={isFollowing}>
                      {isFollowing ? <Loader2 size={20} className="profileActionBtnIconDesign spinner-icon" /> : <UserRoundPlus size={20} className="profileActionBtnIconDesign" />}
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
                <div className="profileTabBarMidIconDesign-Box"><button type="button" className="profileContenttabBtnIconDesign" onClick={() => handleTabClick("FeedVisibleTab")}><LayoutGrid size={23} className="tabIconsBox-MidProfile" /></button></div>
                <div className="profileTabBarMidIconDesign-Box"><button type="button" className="profileContenttabBtnIconDesign" onClick={() => handleTabClick("TimeLineVisibleTab")}><History size={23} className="tabIconsBox-MidProfile" /></button></div>
                <div className="profileTabBarMidIconDesign-Box"><button type="button" className="profileContenttabBtnIconDesign" onClick={() => handleTabClick("TaggedVisibleTab")}><SquareUser size={23} className="tabIconsBox-MidProfile" /></button></div>
              </div>

              {/* Profile footer */}
              <div className="profileFooter-Box">

                {/* Feed Section */}
                {contentVisibleTab === "FeedVisibleTab" && (
                  <div className="contentSectionDesignFeed-Box">
                    {profilePosts && profilePosts.length > 0 ? (
                      profilePosts.map((post) => (
                        <div key={post.fetchPostId} className="profilePostCard-Box">
                          {/* Post - Header */}
                          <div className="profilePostHeaderMain-Box">
                            <div className="profilePostHeaderPFPImage-Box">
                              <img
                                src={
                                  post.profileImage && post.profileImage !== "null"
                                    ? `${post.profileImage}`
                                    : userProfileDataURL?.searchProfilePhoto &&
                                      userProfileDataURL.searchProfilePhoto !== "null"
                                      ? `${userProfileDataURL.searchProfilePhoto}`
                                      : `https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png`
                                }
                                className="profilePostHeaderPFP-Box"
                                alt="profileImage"
                              />
                            </div>
                            <div className="profilePostHeaderUsernameText-box">
                              <div className="profilePostHeaderUserRow">
                                <span className="profilePostHeaderUserText-Box">{post.username || userProfileDataURL.searchUsername}</span>
                                {post.fetchVerified === true && (
                                  <BadgeCheck height="16" width="16" className="profilePostUsernameVerifyBadgeIcon-Box" />
                                )}
                                {post.fetchUploadAt && (
                                  <span className="profilePostTimeText">• {formatPostTime(post.fetchUploadAt)}</span>
                                )}
                              </div>
                              {post.fetchPostLocation && (
                                <span className="profilePostLocationText">{post.fetchPostLocation}</span>
                              )}
                            </div>
                          </div>
                          {/* Post - Caption */}
                          {post?.fetchPostCaption && (
                            <div className="profilePostCaptionMain-Box">
                              <p className="profilePostCaptionText-Box">
                                {post.fetchPostCaption.length > 100 && !expandedCaptions[post.fetchPostId]
                                  ? post.fetchPostCaption.slice(0, 100) + "... "
                                  : post.fetchPostCaption}

                                {post.fetchPostCaption.length > 100 && (
                                  <span
                                    className="captionShowMoreBtn"
                                    onClick={() => toggleCaption(post.fetchPostId)}
                                  >
                                    {expandedCaptions[post.fetchPostId] ? " show less" : "more"}
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          {/* Post Tagged Users */}
                          {post.fetchTaggedUsers && post.fetchTaggedUsers.length > 0 && (
                            <div className="profilePostTaggedUsers-Box">
                              <span className="taggedUserLabel">With </span>
                              {post.fetchTaggedUsers.map((taggedUser) => (
                                <span key={taggedUser} className="taggedUserPill">@{taggedUser}</span>
                              ))}
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
                                  src={post.fetchFileName}
                                  className="profilePostContentView-Box"
                                  style={{ position: 'absolute', top: 0, left: 0 }}
                                  controls
                                  playsInline
                                />
                              ) : (
                                <img
                                  src={post.fetchFileName}
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
                              <div className="postAction-Icons">
                                <button type="button" className="postActionContentBtn-ToogleBox">
                                  <Heart size={23} className="bottomAction-icons" />
                                  {!post.likeHide && post.likeCount && post.likeCount !== "0" && (
                                    <span className="postActionCountText">{post.likeCount}</span>
                                  )}
                                </button>
                              </div>
                              <div className="postAction-Icons">
                                <button type="button" className="postActionContentBtn-ToogleBox">
                                  <Flame size={23} className="bottomAction-icons" />
                                </button>
                              </div>
                              {post.commentEnable === true && (
                                <div className="postAction-Icons">
                                  <button type="button" className="postActionContentBtn-ToogleBox">
                                    <MessageCircleDashed size={23} className="bottomAction-icons" />
                                    {post.commentCount && post.commentCount !== "0" && (
                                      <span className="postActionCountText">{post.commentCount}</span>
                                    )}
                                  </button>
                                </div>
                              )}
                              {post.shareEnable === true && (
                                <div className="postAction-Icons">
                                  <button type="button" className="postActionContentBtn-ToogleBox" title="Copy Link">
                                    <Link2 size={23} className="bottomAction-icons" />
                                  </button>
                                </div>
                              )}
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
                      !loadingPosts && (
                        <div className="errorCheckNoPost-Box">
                          <div className="errorCheckNoPostWrapper-Box">
                            <div className="errorCheckIconPost-Box">
                              <Aperture height="24" width="24" className="errorCheckIconNoPost" />
                            </div>
                            <p className="errorCheckTextNoPost-Box">No Post Yet</p>
                          </div>
                        </div>
                      )
                    )}
                    {loadingPosts && (
                      <div className="feed-loading-spinner-box">
                        <Loader2 size={30} className="spinner-icon" />
                      </div>
                    )}
                  </div>
                )}



                {/* TimeLine Section */}
                {contentVisibleTab === "TimeLineVisibleTab" && (
                  <div className="contentSectionDesignTimeline-Box">
                    {userProfileDataURL.searchUserTimeline ? (
                      <div className="timelineConectionContentMainBox">
                        <div className="connectionTimelineHeaderBar-Box">
                          <span className="spanTimelineHeaderBox">Sharing a connection with <span className="usernameTimelineBoxHiighlight"> {userProfileDataURL.searchUserTimeline}</span></span>
                        </div>
                        <div>
                          <div className="connectionTimelinePostHeaderBox"><span className="spanTimeLinePostHeaderTextBox">Timeline Photos and Videos</span></div>
                          <div className="connectionTimelinePostListBox">
                            <div className="connectionTimelinePostContainerBox grid-3x3">
                              {timelinePosts && timelinePosts.length > 0 ? (
                                timelinePosts.map((post) => (
                                  <div key={post.fetchPostId} className="grid-item">
                                    {post.postType === 'VIDEO' ? (
                                      <>
                                        <video
                                          src={post.fetchFileName}
                                          className="gridImagesList"
                                          muted
                                          playsInline
                                        />
                                        <div className="gridItemVideoBadge">
                                          <Play size={12} fill="white" color="white" />
                                        </div>
                                      </>
                                    ) : (
                                      <img
                                        src={post.fetchFileName}
                                        alt="Timeline Post"
                                        className="gridImagesList"
                                      />
                                    )}
                                  </div>
                                ))
                              ) : (
                                !loadingTimeline && (
                                  <div className="timelineNoPostMsgBox">
                                    <p className="timelineErrorMsgNoPost">
                                      <span>No Uploads</span>
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                        {loadingTimeline && (
                          <div className="feed-loading-spinner-box">
                            <Loader2 size={30} className="spinner-icon" />
                          </div>
                        )}
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
                    <div className="connectionTaggedPostListBox">
                      {taggedPosts && taggedPosts.length > 0 ? (
                        <div className="connectionTaggedPostContainerBox grid-3x3">
                          {taggedPosts.map((post) => (
                            <div key={post.fetchPostId} className="grid-item">
                              {post.postType === 'VIDEO' ? (
                                <>
                                  <video
                                    src={post.fetchFileName}
                                    className="gridImagesList"
                                    muted
                                    playsInline
                                  />
                                  <div className="gridItemVideoBadge">
                                    <Play size={12} fill="white" color="white" />
                                  </div>
                                </>
                              ) : (
                                <img
                                  src={post.fetchFileName}
                                  alt="Tagged Post"
                                  className="gridImagesList"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        !loadingTagged && (
                          <div className="errorCheckNoTagged-Box">
                            <div className="errorCheckNoTaggedWrapper-Box">
                              <div className="errorCheckIconTagged-Box">
                                <CircleUser height="24" width="24" className="errorCheckIconNoTagged" />
                              </div>
                              <p className="errorCheckTextTagged-Box">No Tagged Post</p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    {loadingTagged && (
                      <div className="feed-loading-spinner-box">
                        <Loader2 size={30} className="spinner-icon" />
                      </div>
                    )}
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