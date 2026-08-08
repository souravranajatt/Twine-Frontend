import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import "../Assets/Bundle/CustomVideoPlayer.css";

function CustomVideoPlayer({ src, className = "", isParentModalOpen = false, autoPlay = false }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef(null);

    // Pause video when parent modal opens (for feed background items)
    useEffect(() => {
        if (isParentModalOpen && videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isParentModalOpen]);

    // Handle autoPlay prop
    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.log("Autoplay blocked or failed:", err);
            });
        }
    }, [autoPlay]);

    // IntersectionObserver to pause video when scrolled out of viewport
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        videoEl.pause();
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(videoEl);
        return () => observer.disconnect();
    }, []);

    // Toggle Play / Pause
    const togglePlay = (e) => {
        if (e) e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.error("Video play failed:", err);
            });
        } else {
            video.pause();
            setIsPlaying(false);
        }
        triggerControlsFade();
    };

    // Toggle Mute / Unmute
    const toggleMute = (e) => {
        if (e) e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(video.muted);
        triggerControlsFade();
    };

    const triggerControlsFade = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    const handleMouseEnter = () => {
        setShowControls(true);
    };

    const handleMouseLeave = () => {
        if (isPlaying) {
            setShowControls(false);
        }
    };

    return (
        <div 
            className={`twine-custom-video-container ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={src}
                className="twine-custom-video-element"
                playsInline
                loop
                muted={isMuted}
                preload="metadata"
            />

            {/* Controls Overlay (Only Play/Pause and Volume) */}
            <div className={`twine-video-controls-overlay ${showControls ? "visible" : "hidden"}`}>
                {/* Center Big Play/Pause Button */}
                {!isPlaying && (
                    <button 
                        type="button"
                        className="twine-video-center-play-btn"
                        onClick={togglePlay}
                    >
                        <Play size={28} fill="#ffffff" color="#ffffff" />
                    </button>
                )}

                {/* Bottom Bar: Play/Pause left, Volume right */}
                <div className="twine-video-bottom-bar" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        className="twine-video-control-btn"
                        onClick={togglePlay}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause size={18} fill="#ffffff" color="#ffffff" />
                        ) : (
                            <Play size={18} fill="#ffffff" color="#ffffff" />
                        )}
                    </button>

                    <button
                        type="button"
                        className="twine-video-control-btn"
                        onClick={toggleMute}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? (
                            <VolumeX size={18} color="#ffffff" />
                        ) : (
                            <Volume2 size={18} color="#ffffff" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CustomVideoPlayer;
