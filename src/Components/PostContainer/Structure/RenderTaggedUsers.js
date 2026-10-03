import { useState } from "react";
import { createPortal } from "react-dom";
import { BadgeCheck, Tag, X } from "lucide-react";
import { Link } from "react-router-dom";
import useScrollLock from "../../../Lib/useScrollLock";
import "../Style/RenderTaggedUsers.css";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function RenderTaggedUsers({ taggedUsers }) {
    const [open, setOpen] = useState(false);

    useScrollLock(open);

    if (!taggedUsers || taggedUsers.length === 0) return null;

    const getUserData = (u) => {
        if (typeof u === "string") {
            const cleanName = u.replace(/^@/, "");
            return { id: cleanName, username: cleanName, image: DEFAULT_IMAGE, isVerified: false };
        }
        return {
            id: u.userId || u.username || u._id || u.id,
            username: u.username ? u.username.replace(/^@/, "") : "",
            image: u.profileImage || u.profilePhoto || DEFAULT_IMAGE,
            isVerified: !!(u.verify || u.isVerify || u.fetchVerified)
        };
    };

    return (
        <>
            {/* Trigger pill */}
            <button
                type="button"
                className="twine-tagged-toggle-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                }}
                aria-label="View tagged users"
            >
                <Tag size={12} className="twine-tagged-toggle-icon" />
            </button>

            {/* List modal open - Portalled to body to escape parent overflow:hidden and transform */}
            {open && createPortal(
                <div
                    className="twine-tagged-overlay"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                    }}
                >
                    <div
                        className="twine-tagged-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="twine-tagged-modal-header">
                            <span className="twine-tagged-modal-title">Tagged people</span>
                            <button
                                type="button"
                                className="twine-tagged-modal-close"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                }}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tagged list */}
                        <div className="twine-tagged-modal-list">
                            {taggedUsers.map((item, idx) => {
                                const userData = getUserData(item);
                                return (
                                    <Link
                                        to={`/${userData.username}`}
                                        key={userData.id || idx}
                                        className="twine-tagged-modal-row"
                                        onClick={() => setOpen(false)}
                                    >
                                        <div className="twine-tagged-modal-img-wrap">
                                            <img
                                                src={userData.image}
                                                alt={userData.username}
                                                className="twine-tagged-modal-avatar"
                                            />
                                        </div>
                                        <div className="twine-tagged-modal-name-row">
                                            <span className="twine-tagged-modal-username">{userData.username}</span>
                                            {userData.isVerified && (
                                                <BadgeCheck size={17} className="twine-tagged-modal-badge" />
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default RenderTaggedUsers;
