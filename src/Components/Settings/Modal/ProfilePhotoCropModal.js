import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import getCroppedImg from "../../../Lib/cropImage.js";
import "./ProfilePhotoCropModal.css";


function ProfilePhotoCropModal({ imageSrc, isOpen, onClose, onCropApply }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteCallback = useCallback((croppedArea, currentCroppedAreaPixels) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    try {
      setIsProcessing(true);
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropApply(croppedBase64);
    } catch (err) {
      console.error("Failed to crop image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="crop-modal-overlay" onClick={onClose}>
      <div
        className="crop-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="crop-modal-header">
          <h3 className="crop-modal-title">Crop Profile Picture</h3>
          <button
            type="button"
            className="crop-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Crop Viewport */}
        <div className="crop-modal-cropper-wrapper">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Controls */}
        <div className="crop-modal-controls">
          <div className="crop-modal-slider-row">
            <ZoomOut size={18} className="crop-control-icon" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="crop-zoom-slider"
              aria-label="Zoom"
            />
            <ZoomIn size={18} className="crop-control-icon" />

            <button
              type="button"
              className="crop-rotate-btn"
              onClick={handleRotate}
              title="Rotate 90°"
            >
              <RotateCw size={16} />
              <span>Rotate</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="crop-modal-footer">
          <button
            type="button"
            className="crop-btn-cancel"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="crop-btn-apply"
            onClick={handleApply}
            disabled={isProcessing}
          >
            {isProcessing ? "Cropping..." : "Set Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePhotoCropModal;
