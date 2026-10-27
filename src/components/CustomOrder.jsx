import React, { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n/LanguageContext.jsx";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_TEXT = 500;

/**
 * UI-only stand-in for the real request.
 * Replace the body with a fetch() to your backend / email service, e.g.
 *   return fetch("/api/custom-order", { method: "POST", body: formData });
 */
function sendToAdmin(formData) {
  return new Promise((resolve) => {
    const preview = {};
    formData.forEach((v, k) => { preview[k] = v instanceof File ? `[file] ${v.name} (${v.size} bytes)` : v; });
    console.log("Custom order sent to admin:", preview);
    setTimeout(resolve, 900);
  });
}

export default function CustomOrder() {
  const { t } = useLang();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [drag, setDrag] = useState(false);

  // Build / clean up the preview URL
  useEffect(() => {
    if (!image) { setPreview(""); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  // Hide the success message after a while
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setDone(false), 6000);
    return () => clearTimeout(id);
  }, [done]);

  const pickFile = (file) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) { setImageError("imageBadType"); return; }
    if (file.size > MAX_BYTES) { setImageError("imageTooBig"); return; }
    setImageError("");
    setErrors((e) => ({ ...e, content: undefined }));
    setImage(file);
  };

  const removeImage = () => {
    setImage(null);
    setImageError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!text.trim() && !image) next.content = "needSomething";
    if (!time.trim()) next.time = "required";
    setErrors(next);
    if (Object.keys(next).length) return;

    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("description", text.trim());
    formData.append("estimatedTime", time.trim());

    setSending(true);
    await sendToAdmin(formData);
    setSending(false);
    setDone(true);
    setImage(null); setText(""); setTime(""); setErrors({}); setImageError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form className="custom-card" id="custom_order" onSubmit={handleSubmit} noValidate>
      <div className="custom-head">
        <h3>{t("custom.title")}</h3>
        <p>{t("custom.sub")}</p>
      </div>

      <div className="custom-grid">
        {/* 1. Image */}
        <div className="field">
          <label htmlFor="co-image">{t("custom.imageLabel")}</label>
          {preview ? (
            <div className="upload has-image">
              <img src={preview} alt="" />
              <button type="button" className="upload-remove" onClick={removeImage} aria-label={t("custom.imageRemove")}>✕</button>
            </div>
          ) : (
            <label
              htmlFor="co-image"
              className={"upload" + (drag ? " drag" : "")}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
            >
              <span className="upload-ico">📷</span>
              <b>{t("custom.imageHint")}</b>
              <small>{t("custom.imageRules")}</small>
            </label>
          )}
          <input
            ref={fileRef}
            id="co-image"
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {imageError && <p className="field-error" role="alert">{t(`custom.${imageError}`)}</p>}
        </div>

        {/* 2. Text */}
        <div className="field">
          <label htmlFor="co-text">{t("custom.textLabel")}</label>
          <textarea
            id="co-text"
            rows={6}
            maxLength={MAX_TEXT}
            value={text}
            placeholder={t("custom.textPlaceholder")}
            onChange={(e) => { setText(e.target.value); setErrors((x) => ({ ...x, content: undefined })); }}
            aria-invalid={!!errors.content}
          />
          <small className="counter">{text.length}/{MAX_TEXT}</small>
          {errors.content && <p className="field-error" role="alert">{t(`custom.${errors.content}`)}</p>}
        </div>

        {/* 3. Estimated time */}
        <div className="field">
          <label htmlFor="co-time">{t("custom.timeLabel")}</label>
          <div className="time-wrap">
            <span aria-hidden="true">⏱️</span>
            <input
              id="co-time"
              type="text"
              inputMode="text"
              value={time}
              placeholder={t("custom.timePlaceholder")}
              onChange={(e) => { setTime(e.target.value); setErrors((x) => ({ ...x, time: undefined })); }}
              aria-invalid={!!errors.time}
            />
          </div>
          <small className="hint">{t("custom.timeHint")}</small>
          {errors.time && <p className="field-error" role="alert">{t(`custom.${errors.time}`)}</p>}
        </div>
      </div>

      <div className="custom-foot">
        <button className="btn btn-primary" type="submit" disabled={sending}>
          {sending ? t("custom.sending") : t("custom.submit")}
        </button>
        {done && <p className="form-success" role="status">✔ {t("custom.success")}</p>}
      </div>
    </form>
  );
}
