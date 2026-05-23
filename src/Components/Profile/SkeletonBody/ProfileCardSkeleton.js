import React from "react";
import "./ProfileSkeleton.css";
import PostsSkeleton from "./PostsSkeleton.js";
import HeaderArea from "../../Header/Header.js";
import FooterArea from "../../Footer/Footer.js";

function ProfileCardSkeleton() {
    return (
        <div className="main-wrapper-profile">
            <HeaderArea />
            <div className="middle-main-container">
                <div className="profileContent-Box">

                    {/* Profile Header Skeleton */}
                    <div className="profileHeader-Box">
                        <div className="profileImageHeader-Box">
                            <div className="skeleton skeletonPFP-Box" />
                            <div className="skeletonNameInfo-Box">
                                <div className="skeleton skeletonFullName-Box" />
                                <div className="skeleton skeletonUsername-Box" />
                            </div>
                        </div>

                        <div className="skeletonExtraData-Box">
                            <div className="skeleton skeletonExtraItem-Box" />
                            <div className="skeleton skeletonExtraItem-Box" />
                            <div className="skeleton skeletonExtraItem-Box" />
                        </div>

                        <div className="skeletonBio-Box">
                            <div className="skeleton skeletonBioLine-Box" />
                            <div className="skeleton skeletonBioLineShort-Box" />
                        </div>

                        <div className="skeletonFollowers-Box">
                            <div className="skeleton skeletonFollowerItem-Box" />
                            <div className="skeleton skeletonFollowerItem-Box" />
                        </div>

                        <div className="skeletonButtons-Box">
                            <div className="skeleton skeletonBtn-Box" />
                            <div className="skeleton skeletonBtn-Box" />
                        </div>
                    </div>

                    {/* Tab Bar Skeleton */}
                    <div className="skeletonTabBar-Box">
                        <div className="skeleton skeletonTabIcon-Box" />
                        <div className="skeleton skeletonTabIcon-Box" />
                        <div className="skeleton skeletonTabIcon-Box" />
                    </div>

                    {/* Posts Skeleton */}
                    <PostsSkeleton />

                </div>
            </div>
            <FooterArea />
        </div>
    );
}

export default ProfileCardSkeleton;