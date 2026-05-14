import "./SponsorContainer.scss";

export function SponsorContainer() {
  return <div className="sponsor">
    <div className="sponsor-top-left"></div>
    <div className="sponsor-top-right"></div>
    <div className="sponsor-bottom-left"></div>
    <div className="sponsor-bottom-right"></div>
    <div className="sponsor-inner" />
    <div className="sponsor-content" aria-hidden="true" />
  </div>;
}
