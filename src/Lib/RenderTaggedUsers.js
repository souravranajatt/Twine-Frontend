import { useState, useEffect } from "react";
import { BadgeCheck, Tag, X } from "lucide-react";
import { Link } from "react-router-dom";
import "../Assets/Bundle/RenderTaggedUsers.css";

const DEFAULT_IMAGE = "https://res.cloudinary.com/dgoqiyoeq/image/upload/v1776851796/Twine_DefaultNullImage_qosaiv.png";

function RenderTaggedUsers({ taggedUsers }) {
    const [open, setOpen] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

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

    const count = taggedUsers.length;

    return (
        <>
            {/* Trigger pill */}
            <button
                type="button"
                className="twine-tagged-toggle-btn"
                onClick={() => setOpen(true)}
            >
                <Tag size={12} className="twine-tagged-toggle-icon" />
                <span className="twine-tagged-btn-text">
                    Tagged{count > 1 ? ` +${count}` : ""}
                </span>
            </button>

            {/* Full-screen blur overlay + modal */}
            {open && (
                <div
                    className="twine-tagged-overlay"
                    onClick={() => setOpen(false)}
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
                                onClick={() => setOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable list */}
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
                </div>
            )}
        </>
    );
}

export default RenderTaggedUsers;
