import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

import * as usersApi from "../api/users";
import { useAuth } from "../auth/AuthContext";
import { errorMessage } from "../components/StatusViews";
import { getCroppedImageDataUrl } from "../utils/imageCrop";
import { validatePassword } from "../utils/validation";

export function ProfilePage() {
  const { email, userId, logout } = useAuth();
  const [profileImageDraft, setProfileImageDraft] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [cropSourceImage, setCropSourceImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [applyingCrop, setApplyingCrop] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      setLoadingImage(true);
      setImageError(null);
      try {
        const me = await usersApi.getMe();
        if (!cancelled) {
          setProfileImageDraft(me.profileImage ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          setImageError(errorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoadingImage(false);
        }
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleImageSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setImageError(null);
    const trimmed = profileImageDraft.trim();

    if (
      trimmed &&
      !(trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:image/"))
    ) {
      setImageError("Use a valid image URL (http/https) or upload a file.");
      return;
    }

    try {
      const updated = await usersApi.updateMyProfileImage({
        profileImage: trimmed || null,
      });
      setProfileImageDraft(updated.profileImage ?? "");
      setImageSaved(true);
      setTimeout(() => setImageSaved(false), 1500);
    } catch (err) {
      setImageError(errorMessage(err));
    }
  };

  const handleCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCropPixels(croppedAreaPixels);
  }, []);

  const closeCropModal = () => {
    setCropSourceImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropPixels(null);
    setApplyingCrop(false);
  };

  const handleApplyCrop = async () => {
    if (!cropSourceImage || !cropPixels) {
      setImageError("No crop area selected.");
      return;
    }

    setApplyingCrop(true);
    try {
      const croppedDataUrl = await getCroppedImageDataUrl(cropSourceImage, cropPixels, 512);
      setProfileImageDraft(croppedDataUrl);
      closeCropModal();
    } catch {
      setImageError("Could not crop the selected image.");
      setApplyingCrop(false);
    }
  };

  const handleImageFileChange = async (file: File | null) => {
    setImageError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file.");
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setImageError("Image is too large (max 2 MB).");
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Invalid file result"));
        };
        reader.onerror = () => reject(new Error("Failed to read image file"));
        reader.readAsDataURL(file);
      });

      setCropSourceImage(dataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropPixels(null);
    } catch {
      setImageError("Could not read the selected image file.");
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (!currentPassword.trim()) {
      setPasswordError("Current password is required.");
      return;
    }

    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      setPasswordError(newPasswordError);
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await usersApi.updateMyPassword({
        currentPassword,
        newPassword,
      });
      setPasswordMsg(response.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(errorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <section className="form-page profile-shell">
      <p className="eyebrow">Account workspace</p>
      <h1>Profile</h1>
      <p>
        Signed in as <strong>{email}</strong>.
      </p>
      {userId !== null && <p className="form-help">Your account id is {userId}.</p>}

      <hr className="profile-divider" />

      <form onSubmit={handleImageSubmit} className="vstack profile-panel">
        <h2>Profile image</h2>
        {profileImageDraft ? (
          <img src={profileImageDraft} alt="Profile preview" className="profile-image-preview" />
        ) : (
          <div className="profile-image-preview placeholder">No image selected</div>
        )}

        <label>
          Image URL
          <input
            type="url"
            value={profileImageDraft.startsWith("data:image/") ? "" : profileImageDraft}
            onChange={(e) => setProfileImageDraft(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
        </label>

        <label>
          Or upload image file
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              void handleImageFileChange(file);
              e.currentTarget.value = "";
            }}
          />
        </label>

        <div className="row-actions">
          <button type="submit" disabled={loadingImage}>
            Save image
          </button>
          <button
            type="button"
            disabled={loadingImage}
            onClick={() => {
              setProfileImageDraft("");
            }}
          >
            Remove image
          </button>
        </div>

        {loadingImage && <span className="status">Loading profile image...</span>}
        {imageSaved && <span className="status">Image saved.</span>}
        {imageError && <span className="status error">{imageError}</span>}
        <small className="form-help">
          Your profile image is saved to your account in the backend database.
        </small>
      </form>

      <hr className="profile-divider" />

      <form onSubmit={handlePasswordSubmit} className="vstack profile-panel">
        <h2>Change password</h2>
        <label>
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={savingPassword}>
          {savingPassword ? "Saving..." : "Change password"}
        </button>
        {passwordMsg && <span className="status">{passwordMsg}</span>}
        {passwordError && <span className="status error">{passwordError}</span>}
      </form>

      <button type="button" onClick={logout} className="logout-button">
        Log out
      </button>

      {cropSourceImage && (
        <div className="crop-modal-backdrop" role="dialog" aria-modal="true" aria-label="Crop profile image">
          <div className="crop-modal-card">
            <h3>Adjust crop</h3>
            <p className="form-help">Move and zoom the image, then apply the crop.</p>
            <div className="crop-stage">
              <Cropper
                image={cropSourceImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <label>
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
            <div className="row-actions">
              <button type="button" onClick={handleApplyCrop} disabled={applyingCrop}>
                {applyingCrop ? "Applying..." : "Apply crop"}
              </button>
              <button type="button" onClick={closeCropModal} disabled={applyingCrop}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
