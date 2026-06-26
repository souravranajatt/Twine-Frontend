import React, { useState, useRef, useEffect } from "react";
import { MapPin, BriefcaseBusiness, CalendarDays, Link2, BadgeCheck, Copy, UserX, Flag, Venus, Mars, Loader2 } from "lucide-react";
import { blockUserAPI, unblockUserAPI } from "../../../Utils/userProfileAPI.js";
import "./PopupModal.css";

function PopupModal({ isOpen, onClose, userProfileDataURL, onProfileRefresh, username }) {

    const [localData, setLocalData] = useState(null);
    const [isBlocking, setIsBlocking] = useState(false);
    const blockActionPendingRef = useRef(false);

    // Keep localPost 
    useEffect(() => {
        if (isOpen && userProfileDataURL) {
            setLocalData(userProfileDataURL);
        }
    }, [isOpen, userProfileDataURL]);


    // Handle Block/Unblock user
    const handleBlock = async () => {
        if (blockActionPendingRef.current || isBlocking || !localData) return;

        const previousStatus = localData.blockedStatus;
        const newStatus = !previousStatus;

        // Optimistic update
        const optimisticData = { ...localData, blockedStatus: newStatus };
        setLocalData(optimisticData);
        onProfileRefresh((prev) => ({ ...prev, blockedStatus: newStatus }));

        blockActionPendingRef.current = true;
        setIsBlocking(true);

        try {
            if (previousStatus) {
                await unblockUserAPI(userProfileDataURL.searchUserId);
            } else {
                await blockUserAPI(userProfileDataURL.searchUserId);
            }
            onClose();
        } catch (error) {
            // Revert optimistic update on failure
            const revertedData = { ...localData, blockedStatus: previousStatus };
            setLocalData(revertedData);
            onProfileRefresh((prev) => ({ ...prev, blockedStatus: previousStatus }));
            console.error("Block/unblock failed:", error);
        } finally {
            setIsBlocking(false);
            blockActionPendingRef.current = false;
        }
    };

    // Handle Copy Link API
    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/${username}/posts`);
        onClose();
    };

    if (!isOpen || !localData) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="popupBackdrop-Box" onClick={onClose} />

            {/* Modal */}
            <div className="popupModal-Box">

                {/* Modal Header */}
                <div className="popupModalHeader-Box">
                    <p className="popupModalUsername-Box">@{userProfileDataURL.searchUsername}</p>
                </div>

                {/* Modal Info Section */}
                <div className="popupModalInfo-Box">

                    {userProfileDataURL?.searchCreatedAt && (
                        <div className="popupModalInfoRow-Box">
                            <CalendarDays height="15" width="15" className="popupModalInfoIcon-Box" />
                            <span className="popupModalInfoText-Box">
                                Joined {new Date(userProfileDataURL.searchCreatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </span>
                        </div>
                    )}

                    {userProfileDataURL?.searchBadge && (
                        <div className="popupModalInfoRow-Box">
                            <BriefcaseBusiness height="15" width="15" className="popupModalInfoIcon-Box" />
                            <span className="popupModalInfoText-Box">{userProfileDataURL.searchBadge}</span>
                        </div>
                    )}

                    {userProfileDataURL?.searchUserLocation && (
                        <div className="popupModalInfoRow-Box">
                            <MapPin height="15" width="15" className="popupModalInfoIcon-Box" />
                            <span className="popupModalInfoText-Box">{userProfileDataURL.searchUserLocation}</span>
                        </div>
                    )}

                    {userProfileDataURL?.searchGender && (
                        <div className="popupModalInfoRow-Box">
                            {userProfileDataURL.searchGender === "Female"
                                ? <Venus height="15" width="15" className="popupModalInfoIcon-Box" />
                                : <Mars height="15" width="15" className="popupModalInfoIcon-Box" />
                            }
                            <span className="popupModalInfoText-Box">{userProfileDataURL.searchUserGender}</span>
                        </div>
                    )}

                    {userProfileDataURL?.searchUserLink && (
                        <div className="popupModalInfoRow-Box">
                            <Link2 height="15" width="15" className="popupModalInfoIcon-Box" />
                            <span className="popupModalInfoLink-Box">{userProfileDataURL.searchUserLink}</span>
                        </div>
                    )}

                    {userProfileDataURL?.searchVerified === true && (
                        <div className="popupModalInfoRow-Box">
                            <BadgeCheck height="15" width="15" className="popupModalVerifiedIcon-Box" />
                            <span className="popupModalInfoText-Box">Verified Account</span>
                        </div>
                    )}

                </div>

                {/* Modal Bottom Actions */}
                {userProfileDataURL?.searchLoggedUser === false && (
                    <div className="popupModalActions-Box">
                        <button className="popupActionBtn-Box" onClick={handleCopyLink}>
                            <Copy height="16" width="16" className="popupActionIcon-Box" />
                            <span>Copy link</span>
                        </button>
                        <div className="popupActionDivider-Box" />
                        <button className="popupActionBtn-Box popupActionDanger-Box" onClick={handleBlock} disabled={isBlocking}>
                            {isBlocking
                                ? <Loader2 size={16} className="popupActionIcon-Box spinner-icon" />
                                : <UserX height="16" width="16" className="popupActionIcon-Box" />}
                            <span>{localData.blockedStatus ? "Unblock" : "Block"}</span>
                        </button>
                        <div className="popupActionDivider-Box" />
                        <button className="popupActionBtn-Box popupActionDanger-Box">
                            <Flag height="16" width="16" className="popupActionIcon-Box" />
                            <span>Report</span>
                        </button>
                    </div>
                )}

            </div>
        </>
    );
}

export default PopupModal;