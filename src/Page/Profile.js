import React, { useState, useEffect, useRef } from "react";
import {
  HeartPlus, UserLock, UserRoundPlus, UserRoundCheck,
  LayoutGrid, History, SquareUser, MapPin, BadgeCheck,
  BriefcaseBusiness, CalendarDays, Loader2, MoreHorizontal
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "../Assets/Bundle/Profile.css";
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import NotFoundPage from "../ErrorHandler/ErrrorDesign/ErrorPageDesign";
import InternalErrorPage from "../ErrorHandler/ErrrorDesign/InternalErrorPageDesign";
import { followUserAPI, unfollowUserAPI, cancelFollowRequestAPI, userProfilePageAPI, unblockUserAPI, sendSecretCrushAPI } from "../Utils/userProfileAPI.js";
import FeedPosts from "../Components/Profile/FeedTab/FeedPosts.js";
import TimelinePosts from "../Components/Profile/TimelineTab/TimelinePosts.js";
import TaggedPosts from "../Components/Profile/TaggedTab/TaggedPosts.js";
import PopupModal from "../Components/Profile/PopupModal/PopupModal.js";
import FollowerList from "../Components/Profile/PopupModal/FollowerList.js";
import ProfileCardSkeleton from "../Components/Profile/SkeletonBody/ProfileCardSkeleton.js";

const VALID_TABS = ["posts", "timeline", "tagged"];

function Profile() {

  const { username, tab } = useParams();
  const navigate = useNavigate();

  // Tab Url State

  const [contentVisibleTab, setContentVisibleTab] = useState(() => {
    if (tab === "timeline") return "TimeLineVisibleTab";
    if (tab === "tagged") return "TaggedVisibleTab";
    return "FeedVisibleTab";
  });

  useEffect(() => {
    if (tab === "timeline") setContentVisibleTab("TimeLineVisibleTab");
    else if (tab === "tagged") setContentVisibleTab("TaggedVisibleTab");
    else setContentVisibleTab("FeedVisibleTab");
  }, [tab]);

  const handleTabClick = (newTab) => {
    if (newTab === "FeedVisibleTab") navigate(`/${username}/posts`, { replace: true });
    else if (newTab === "TimeLineVisibleTab") navigate(`/${username}/timeline`, { replace: true });
    else if (newTab === "TaggedVisibleTab") navigate(`/${username}/tagged`, { replace: true });
  };

  // Profile Data
  const [userProfileDataURL, setUserProfileDataURL] = useState(null);
  const [userProfileStatusURL, setUserProfileStatusURL] = useState("LoadingUserProfileURL");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await userProfilePageAPI(username);
        setUserProfileDataURL(profileData);
        setUserProfileStatusURL("FoundUserProfileURL");
      } catch (err) {
        if (err.message === "NotFoundUserProfileURL") setUserProfileStatusURL("NotFoundUserProfileURL");
        else setUserProfileStatusURL("ErrorUserProfileURL");
      }
    };
    fetchProfile();
  }, [username]);

  // Follow State
  const [followCheckStatus, setFollowCheckStatus] = useState(false);
  const [followRequestSentCheckStatus, setFollowRequestSentCheckStatus] = useState(false);
  const [accountPrivateCheckStatus, setAccountPrivateCheckStatus] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [isSecretLikeSend, setIsSecretLikeSend] = useState(false);

  const followActionPendingRef = useRef(false);
  const secretActionPendingRef = useRef(false);
  const unblockActionPendingRef = useRef(false);

  useEffect(() => {
    if (userProfileDataURL !== null) {
      setAccountPrivateCheckStatus(userProfileDataURL.searchPrivate);
      setFollowCheckStatus(userProfileDataURL.followingStatus);
      setFollowRequestSentCheckStatus(userProfileDataURL.followReqStatus);
    }
  }, [userProfileDataURL]);

  // Follow Button Type & Action Handler
  let actionType = null;
  if (userProfileDataURL && userProfileDataURL.searchLoggedUser === false) {
    if (followCheckStatus) actionType = "UNFOLLOWBTN";
    else if (accountPrivateCheckStatus && followRequestSentCheckStatus) actionType = "REQUESTEDBTN";
    else actionType = "FOLLOWBTN";
  }


  // Handle Follow API Call
  const handleFollow = async (e) => {
    e.preventDefault();
    if (!userProfileDataURL || followActionPendingRef.current) return;

    followActionPendingRef.current = true;
    setIsFollowing(true);

    try {
      await followUserAPI(userProfileDataURL.searchUserId);

      setUserProfileDataURL(prev => {
        // Private account 
        if (prev.searchPrivate) {
          return {
            ...prev,
            followingStatus: false,
            followReqStatus: true,
            searchPrivateShow: false,
          };
        }
        // Public account 
        return {
          ...prev,
          followingStatus: true,
          followReqStatus: false,
          searchPrivateShow: true,
          followersCount: prev.followersCount + 1
        };
      });

    } catch (error) {
      console.log("Error occurred!");
    } finally {
      setIsFollowing(false);
      followActionPendingRef.current = false;
    }
  };

  // Handle Unfollow API Call
  const handleUnfollow = async (e) => {
    e.preventDefault();
    if (!userProfileDataURL || followActionPendingRef.current) return;

    followActionPendingRef.current = true;
    setIsFollowing(true);

    try {
      await unfollowUserAPI(userProfileDataURL.searchUserId);

      setUserProfileDataURL(prev => {
        // Private account unfollow
        if (prev.searchPrivate) {
          return {
            ...prev,
            followingStatus: false,
            followReqStatus: false,
            searchPrivateShow: false,
            followersCount: prev.followersCount - 1
          };
        }
        // Public account unfollow
        return {
          ...prev,
          followingStatus: false,
          followReqStatus: false,
          searchPrivateShow: true,
          followersCount: prev.followersCount - 1
        };
      });

    } catch (error) {
      console.log("Error occurred!");
    } finally {
      setIsFollowing(false);
      followActionPendingRef.current = false;
    }
  };

  // Handle Follow Request Cancel API Call 
  const handleCancelRequest = async (e) => {
    e.preventDefault();
    if (!userProfileDataURL || followActionPendingRef.current) return;

    followActionPendingRef.current = true;
    setIsFollowing(true);

    try {
      await cancelFollowRequestAPI(userProfileDataURL.searchUserId);

      setUserProfileDataURL(prev => ({
        ...prev,
        followReqStatus: false,
        followingStatus: false,
        searchPrivateShow: false
      }));

    } catch (error) {
      console.log("Error occurred!");
    } finally {
      setIsFollowing(false);
      followActionPendingRef.current = false;
    }
  };

  // Send Secret Crush API
  const handleSendSecretLike = async (e) => {
    e.preventDefault();
    if (!userProfileDataURL || secretActionPendingRef.current) return;

    secretActionPendingRef.current = true;
    setIsSecretLikeSend(true);

    try {
      await sendSecretCrushAPI(userProfileDataURL.searchUserId);
      setUserProfileDataURL(prev => ({
        ...prev,
        crushSentStatus: true
      }));
    }
    catch (error) {
      console.log("Error occured!");
    }
    finally {
      setIsSecretLikeSend(false);
      secretActionPendingRef.current = false;
    }
  };

  // Handle Unblock API
  const handleUnblock = async () => {
    if (!userProfileDataURL || unblockActionPendingRef.current) return;

    unblockActionPendingRef.current = true;
    setIsUnblocking(true);

    try {
      await unblockUserAPI(userProfileDataURL.searchUserId);
      setUserProfileDataURL((prev) => ({
        ...prev,
        blockedStatus: false
      }));
    } catch (error) {
      console.log("Error occured!");
    } finally {
      setIsUnblocking(false);
      unblockActionPendingRef.current = false;
    }
  };

  // Invalid Tab States and Loadin state
  if (tab && !VALID_TABS.includes(tab)) {
    return <NotFoundPage />;
  }

  if (userProfileStatusURL === "LoadingUserProfileURL") {
    return <ProfileCardSkeleton />;
  }

  if (userProfileStatusURL === "NotFoundUserProfileURL") return <div className="error"><NotFoundPage /></div>;
  if (userProfileStatusURL === "ErrorUserProfileURL") return <div className="error"><InternalErrorPage /></div>;

  return (
    <>
      <div className="main-wrapper-profile">
        <HeaderArea />

        <main className="middle-main-container">
          <div className="profileContent-Box">

            {/* Profile Header */}
            <div className="profileHeader-Box">
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
                  <p className="profileUserNameInfoTag-Box">
                    @{userProfileDataURL.searchUsername}{" "}
                    {userProfileDataURL.searchVerified === true && (
                      <BadgeCheck height="20" width="20" className="profileUsernameVerifyBadgeIcon-Box" />
                    )}
                  </p>
                </div>

                {/* Three Dot Button */}
                <button className="profileThreeDotBtn-Box" onClick={() => setIsModalOpen(true)}>
                  <MoreHorizontal size={22} className="profileThreeDotIcon-Box" />
                </button>
              </div>

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
                    ? `Joined ${new Date(userProfileDataURL.searchCreatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                    : ""}
                </p>
              </div>

              {userProfileDataURL?.searchUserBio && (
                <div className="profileBioData-Box">
                  <p className="profileBioDataInfoPara-Box">{userProfileDataURL.searchUserBio}</p>
                </div>
              )}

              <div className="userFollowDataInfoPack">
                <p
                  className={`userFollowDataContentBox ${(userProfileDataURL.searchPrivateShow || userProfileDataURL.searchLoggedUser)
                    ? "clickable-followers"
                    : ""
                    }`}
                  onClick={() => {
                    if (userProfileDataURL.searchPrivateShow || userProfileDataURL.searchLoggedUser) {
                      setIsFollowersModalOpen(true);
                    }
                  }}
                >
                  {userProfileDataURL.followersCount} Followers
                </p>
                <p className="userFollowDataContentBox">{userProfileDataURL.postCount} Posts</p>
              </div>

              {/* Follow & Like Buttons */}
              {(userProfileDataURL.searchLoggedUser === false && userProfileDataURL.blockedStatus === false) && (
                <div className="profileActionContentBtn-Box">
                  {actionType === "UNFOLLOWBTN" && (
                    <button className="profileUnFollowActionBtns-Box" onClick={handleUnfollow} disabled={isFollowing}>
                      {isFollowing
                        ? <Loader2 size={20} className="profileActionBtnIconDesign spinner-icon" />
                        : <UserRoundCheck size={20} className="profileActionBtnIconDesign" />}
                      <span className="followActionButtonSpan">Unfollow</span>
                    </button>
                  )}
                  {actionType === "REQUESTEDBTN" && (
                    <button className="profileUnFollowActionBtns-Box" onClick={handleCancelRequest} disabled={isFollowing}>
                      {isFollowing
                        ? <Loader2 size={20} className="profileActionBtnIconDesign spinner-icon" />
                        : <UserRoundCheck size={20} className="profileActionBtnIconDesign" />}
                      <span className="followActionButtonSpan">Requested</span>
                    </button>
                  )}
                  {actionType === "FOLLOWBTN" && (
                    <button className="profileFollowActionBtns-Box" onClick={handleFollow} disabled={isFollowing}>
                      {isFollowing
                        ? <Loader2 size={20} className="profileActionBtnIconDesign spinner-icon" />
                        : <UserRoundPlus size={20} className="profileActionBtnIconDesign" />}
                      <span className="followActionButtonSpan">
                        {userProfileDataURL.followerStatus === true ? <>Follows you</> : <>Follow</>}
                      </span>
                    </button>
                  )}
                  {!userProfileDataURL.crushStatus && !userProfileDataURL.crushSentStatus && (
                    <button className="profileSendLikeActionBtns-Box" name="action" value="likeSend" onClick={handleSendSecretLike} disabled={isSecretLikeSend}>
                      {isSecretLikeSend ? <Loader2 size={20} className="profileActionBtnIconDesign spinner-icon" /> : <HeartPlus size={20} className="profileActionBtnIconDesign" />}
                      <span>{isSecretLikeSend ? "Sending..." : "Send Crush"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            { /* Profile Middle Tabs Feed, Timeline & Tagged */}

            {userProfileDataURL.blockedStatus === true ? (
              <div className="AccountPrivateContentMsgBox">
                <div className="AccountPrivateDilaugeBox">
                  <div className="LockedAccountIconBox">
                    <UserLock height="24" width="24" className="LockedAccountIconContentBox" />
                  </div>
                  <p className="LockedAccountSpanMsgBox"><span>Blocked Account</span></p>
                </div>
                <div className="contextMsgBox">
                  <p className="contextMsgBoxParagraphText">
                    <span>You've blocked this account.</span>
                  </p>
                </div>
                {userProfileDataURL.searchLoggedUser === false && (
                  <div className="profileActionContentBtn-Box">
                    <button className="profileUnFollowActionBtns-Box" onClick={handleUnblock} disabled={isUnblocking}>
                      {isUnblocking
                        ? <Loader2 size={20} className="profileActionBtnIconDesign spinner-icon" />
                        : <UserRoundCheck size={20} className="profileActionBtnIconDesign" />}
                      <span>Unblock</span>
                    </button>
                  </div>
                )}
              </div>

            ) : userProfileDataURL.searchPrivateShow === true ? (
              /* 2. Public / Following — Tabs */
              <>
                <div className="profileMiddle-Box">
                  <div className="profileTabBarMidIconDesign-Box">
                    <button type="button" className="profileContenttabBtnIconDesign" onClick={() => handleTabClick("FeedVisibleTab")}>
                      <LayoutGrid size={23} className="tabIconsBox-MidProfile" />
                    </button>
                  </div>
                  <div className="profileTabBarMidIconDesign-Box">
                    <button type="button" className="profileContenttabBtnIconDesign" onClick={() => handleTabClick("TimeLineVisibleTab")}>
                      <History size={23} className="tabIconsBox-MidProfile" />
                    </button>
                  </div>
                  <div className="profileTabBarMidIconDesign-Box">
                    <button type="button" className="profileContenttabBtnIconDesign" onClick={() => handleTabClick("TaggedVisibleTab")}>
                      <SquareUser size={23} className="tabIconsBox-MidProfile" />
                    </button>
                  </div>
                </div>

                {/* Content Feed, Timeline & Tagged */}
                <div className="profileFooter-Box">
                  {contentVisibleTab === "FeedVisibleTab" && (
                    <FeedPosts
                      username={username}
                      userProfileDataURL={userProfileDataURL}
                      contentVisibleTab={contentVisibleTab}
                    />
                  )}
                  {contentVisibleTab === "TimeLineVisibleTab" && (
                    <TimelinePosts
                      username={username}
                      userProfileDataURL={userProfileDataURL}
                      contentVisibleTab={contentVisibleTab}
                    />
                  )}
                  {contentVisibleTab === "TaggedVisibleTab" && (
                    <TaggedPosts
                      username={username}
                      userProfileDataURL={userProfileDataURL}
                      contentVisibleTab={contentVisibleTab}
                    />
                  )}
                </div>
              </>

            ) : (
              /* 3. Private — Locked Account */
              <div className="AccountPrivateContentMsgBox">
                <div className="AccountPrivateDilaugeBox">
                  <div className="LockedAccountIconBox">
                    <UserLock height="16" width="16" className="LockedAccountIconContentBox" />
                  </div>

                  <div className="contextMsgBox">
                    <p className="LockedAccountSpanMsgBox">
                      <span>This profile is locked</span>
                    </p>
                    <p className="contextMsgBoxParagraphText">
                      <span>Follow to see their posts and timelines.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        <FooterArea />
      </div>

      {/* Popup Modal */}
      <PopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userProfileDataURL={userProfileDataURL}
        username={username}
        onProfileRefresh={(freshProfile) => setUserProfileDataURL(freshProfile)}
      />

      {/* Follower List Modal */}
      <FollowerList
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        targetUserId={userProfileDataURL?.searchUserId}
      />
    </>
  );
}

export default Profile;