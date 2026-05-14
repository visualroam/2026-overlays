import { useEffect, useState } from "react";
import { SPONSOR_IMAGES, SPONSOR_ROTATION_MS } from "./sponsorImages";
import "./SponsorContainer.scss";

export function SponsorContainer() {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (SPONSOR_IMAGES.length < 2) return;
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % SPONSOR_IMAGES.length);
    }, SPONSOR_ROTATION_MS);
    return () => window.clearInterval(id);
  }, []);

  const sponsorCount = SPONSOR_IMAGES.length;
  const sponsorSrc =
    sponsorCount > 0 ? SPONSOR_IMAGES[slideIndex % sponsorCount] : null;

  return (
    <div className="sponsor">
      <div className="sponsor-top-left" />
      <div className="sponsor-top-right" />
      <div className="sponsor-bottom-left" />
      <div className="sponsor-bottom-right" />
      <div className="sponsor-inner" />
      <div className="sponsor-content">
        {sponsorSrc ? (
          <div className="sponsor-slideshow">
            <img src={sponsorSrc} alt="" className="sponsor-slideshow__img" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
