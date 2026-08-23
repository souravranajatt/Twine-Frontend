import React, { useState, useRef } from "react";
import { acceptRequestAPI, rejectRequestAPI } from "../../../Utils/userProfileAPI.js";
import "./RequestOptionBox.css";
import "../../../Assets/Bundle/GlobalSpinner.css";

function RequestOptionBox({ userProfileDataURL, onProfileRefresh }) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const actionPendingRef = useRef(false);

    const isProcessing = isAccepting || isRejecting;

    // If profile is own, or no data, or no incoming follow request
    if (!userProfileDataURL || userProfileDataURL.searchLoggedUser || !userProfileDataURL.followReqOptStatus) {
        return null;
    }

    const targetUserId = userProfileDataURL.searchUserId;
    const username = userProfileDataURL.searchUsername;

    // Handle Accept Follow Request
    const handleAccept = async () => {
        if (actionPendingRef.current || isProcessing || !userProfileDataURL) return;

        actionPendingRef.current = true;
        setIsAccepting(true);

        try {
            await acceptRequestAPI(targetUserId);
            if (onProfileRefresh) {
                onProfileRefresh((prev) => ({
                    ...prev,
                    followReqOptStatus: false,
                    followerStatus: true
                }));
            }
        } catch (error) {
            console.error("Failed to accept follow request:", error);
        } finally {
            setIsAccepting(false);
            actionPendingRef.current = false;
        }
    };

    // Handle Reject Follow Request
    const handleReject = async () => {
        if (actionPendingRef.current || isProcessing || !userProfileDataURL) return;

        actionPendingRef.current = true;
        setIsRejecting(true);

        try {
            await rejectRequestAPI(targetUserId);
            if (onProfileRefresh) {
                onProfileRefresh((prev) => ({
                    ...prev,
                    followReqOptStatus: false
                }));
            }
        } catch (error) {
            console.error("Failed to reject follow request:", error);
        } finally {
            setIsRejecting(false);
            actionPendingRef.current = false;
        }
    };

    return (
        <div className="requestOptionTopBar">
            <div className="requestOptionMessage">
                <span className="requestOptionUsername">@{username || "User"}</span> has requested to follow you
            </div>

            <div className="requestOptionBtnGroup">
                <button
                    type="button"
                    className="requestOptionBtn requestOptionAcceptBtn"
                    onClick={handleAccept}
                    disabled={isProcessing}
                >
                    {isAccepting ? (
                        <span className="twine-profile-actions-follow-btn-spinner"></span>
                    ) : (
                        "Accept"
                    )}
                </button>

                <button
                    type="button"
                    className="requestOptionBtn requestOptionRejectBtn"
                    onClick={handleReject}
                    disabled={isProcessing}
                >
                    {isRejecting ? (
                        <span className="twine-profile-actions-others-btn-spinner"></span>
                    ) : (
                        "Reject"
                    )}
                </button>
            </div>
        </div>
    );
}

export default RequestOptionBox;
