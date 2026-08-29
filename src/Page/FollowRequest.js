import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Check, X } from "lucide-react";
import HeaderArea from "../Components/Header/Header.js";
import FooterArea from "../Components/Footer/Footer.js";
import useInfiniteScroll from "../Lib/useInfiniteScroll.js";
import { fetchFollowRequestsAPI } from "../Utils/homePageAPI.js";
import { acceptRequestAPI, rejectRequestAPI } from "../Utils/userProfileAPI.js";
import "../Assets/Bundle/GlobalSpinner.css";
import "../Assets/Bundle/FollowRequest.css";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";
const PAGE_SIZE = 15;

function FollowRequest() {
    const [requests, setRequests] = useState([]);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const isFetchingRef = useRef(false);
    const hasFetchedInitial = useRef(false);
    const pageRef = useRef(0);

    // Action status & loading per userId
    const [actionLoading, setActionLoading] = useState({});
    const [actionStatus, setActionStatus] = useState({});
    const actionRef = useRef({});

    // Fetch follow requests from backend API
    const fetchRequests = async (pageToFetch) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        if (pageToFetch === 0) {
            setLoadingInitial(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const data = await fetchFollowRequestsAPI(pageToFetch, PAGE_SIZE);
            const fetchedList = data || [];

            if (fetchedList.length < PAGE_SIZE) {
                setHasMore(false);
            }

            setRequests((prev) => {
                if (pageToFetch === 0) return fetchedList;
                const existingIds = new Set(prev.map((u) => u.userId));
                const newRequests = fetchedList.filter((u) => !existingIds.has(u.userId));
                return [...prev, ...newRequests];
            });
        } catch (err) {
            console.error("Failed to fetch follow requests:", err);
            setHasMore(false);
        } finally {
            isFetchingRef.current = false;
            setLoadingInitial(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = useCallback(() => {
        pageRef.current += 1;
        fetchRequests(pageRef.current);
    }, []);

    useInfiniteScroll({
        loading: loadingInitial || loadingMore,
        hasMore,
        onLoadMore: handleLoadMore,
        activeTab: "follow-requests",
        tabName: "follow-requests"
    });

    useEffect(() => {
        if (hasFetchedInitial.current) return;
        hasFetchedInitial.current = true;
        fetchRequests(0);
    }, []);

    // Confirm / Accept Follow Request API call
    const handleConfirm = async (userId) => {
        if (!userId || actionRef.current[userId]) return;

        actionRef.current[userId] = true;
        setActionLoading((prev) => ({ ...prev, [userId]: "CONFIRM" }));

        try {
            await acceptRequestAPI(userId);
            setActionStatus((prev) => ({ ...prev, [userId]: "CONFIRMED" }));
        } catch (error) {
            console.error("Failed to accept follow request:", error);
        } finally {
            setActionLoading((prev) => ({ ...prev, [userId]: null }));
            actionRef.current[userId] = false;
        }
    };

    // Delete / Reject Follow Request API call
    const handleDelete = async (userId) => {
        if (!userId || actionRef.current[userId]) return;

        actionRef.current[userId] = true;
        setActionLoading((prev) => ({ ...prev, [userId]: "DELETE" }));

        try {
            await rejectRequestAPI(userId);
            setActionStatus((prev) => ({ ...prev, [userId]: "DELETED" }));
        } catch (error) {
            console.error("Failed to reject follow request:", error);
        } finally {
            setActionLoading((prev) => ({ ...prev, [userId]: null }));
            actionRef.current[userId] = false;
        }
    };

    const pendingCount = requests.filter((r) => !actionStatus[r.userId]).length;

    return (
        <div className="follow-request-page-container">
            <HeaderArea />

            <main className="follow-request-main-content">
                <div className="follow-request-wrapper-box">
                    <div className="follow-request-header-section">
                        <div className="follow-request-header-text-group">
                            <h1 className="follow-request-header-title">Follow Requests</h1>
                            <p className="follow-request-header-subtitle">
                                Manage incoming follow requests from people who want to follow you.
                            </p>
                        </div>
                        {!loadingInitial && pendingCount > 0 && (
                            <span className="follow-request-count-badge">
                                {pendingCount} Pending
                            </span>
                        )}
                    </div>

                    {loadingInitial ? (
                        <div className="follow-request-skel-list">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="follow-request-skel-item">
                                    <div className="skel-suggestion-avatar follow-request-skel-avatar-row" />
                                    <div className="follow-request-skel-meta">
                                        <div className="skel-suggestion-text follow-request-skel-name-line" />
                                        <div className="skel-suggestion-text follow-request-skel-user-line" />
                                    </div>
                                    <div className="follow-request-skel-actions-row">
                                        <div className="skel-suggestion-btn follow-request-skel-btn-row" />
                                        <div className="skel-suggestion-btn follow-request-skel-btn-row" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="follow-request-list">
                                {requests.map((user) => {
                                    const avatarSrc =
                                        user.profilePicture && user.profilePicture !== "null"
                                            ? user.profilePicture
                                            : DEFAULT_AVATAR;
                                    const displayName = user.name || user.username;
                                    const userId = user.userId;
                                    const status = actionStatus[userId];
                                    const currentLoading = actionLoading[userId];
                                    const isAnyActionLoading = Boolean(currentLoading);

                                    return (
                                        <div key={userId} className="follow-request-list-item">
                                            <Link to={`/${user.username}`} className="follow-request-item-user-info">
                                                <img
                                                    src={avatarSrc}
                                                    alt={displayName}
                                                    className="follow-request-item-avatar"
                                                />
                                                <div className="follow-request-item-meta">
                                                    <div className="follow-request-item-name-row">
                                                        <span className="follow-request-item-name">{displayName}</span>
                                                        {user.verify && (
                                                            <BadgeCheck size={16} className="follow-request-verify-badge" />
                                                        )}
                                                    </div>
                                                    <div className="follow-request-item-username-row">
                                                        <span className="follow-request-item-username">@{user.username}</span>
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="follow-request-actions-group">
                                                {status === "CONFIRMED" ? (
                                                    <span className="follow-request-status-badge confirmed">
                                                        <Check size={14} /> Confirmed
                                                    </span>
                                                ) : status === "DELETED" ? (
                                                    <span className="follow-request-status-badge deleted">
                                                        <X size={14} /> Rejected
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleConfirm(userId)}
                                                            disabled={isAnyActionLoading}
                                                            className="follow-request-confirm-btn"
                                                        >
                                                            {currentLoading === "CONFIRM" ? (
                                                                <div className="twine-profile-actions-follow-btn-spinner"></div>
                                                            ) : (
                                                                "Confirm"
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(userId)}
                                                            disabled={isAnyActionLoading}
                                                            className="follow-request-delete-btn"
                                                        >
                                                            {currentLoading === "DELETE" ? (
                                                                <div className="twine-profile-actions-others-btn-spinner"></div>
                                                            ) : (
                                                                "Delete"
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {loadingMore && (
                                <div className="twine-loader-spinner-center" style={{ margin: "24px 0" }}>
                                    <span className="twine-loader-spinner"></span>
                                </div>
                            )}

                            {!hasMore && requests.length > 0 && (
                                <p className="no-more-follow-requests">You've reached the end of follow requests.</p>
                            )}

                            {!loadingMore && requests.length === 0 && (
                                <p className="no-more-follow-requests">No pending follow requests right now.</p>
                            )}
                        </>
                    )}
                </div>
            </main>

            <FooterArea />
        </div>
    );
}

export default FollowRequest;
