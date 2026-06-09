import React from "react";

const renderFormattedCaption = (text, postId, isExpanded, toggleFn, fullLength) => {
    if (!text) return null;

    let displayText = text;
    let hasMore = fullLength > 100;
    if (hasMore && !isExpanded) {
        displayText = text.slice(0, 100) + "... ";
    }

    const words = displayText.split(/(\s+)/);

    return (
        <>
            {words.map((word, index) => {
                if (word.startsWith("#")) {
                    return (
                        <span key={index} className="caption-hashtag">
                            {word}
                        </span>
                    );
                } else if (word.startsWith("@")) {
                    const cleanUsername = word.replace(/^@/, "").match(/^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*/)?.[0] || "";
                    return (
                        <span
                            key={index}
                            className="caption-mention"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/${cleanUsername}`;
                            }}
                        >
                            {word}
                        </span>
                    );
                }
                return word;
            })}
            {hasMore && (
                <span
                    className="captionShowMoreBtn"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFn(postId);
                    }}
                >
                    {isExpanded ? " show less" : "more"}
                </span>
            )}
        </>
    );
};

export default renderFormattedCaption;
