import heroCutout from '../assets/hero-cutout.png';
import { HERO_OUTLINE_PATH, HERO_OUTLINE_VIEWBOX } from './heroOutline';

function Profile() {
  return (
    <figure className="hero-cutout">
      {/* Backdrop disc that anchors the figure to the page */}
      <span className="hero-cutout-ring" aria-hidden="true">
        {/* Angkor Wat skyline inside the disc */}
        <span className="hero-ring-angkor" />
      </span>

      <div className="hero-cutout-figure">
        <img
          src={heroCutout}
          alt="Cheng Virak in traditional Khmer dress"
          className="hero-cutout-img"
        />

        {/* Light that travels around the outline of the figure */}
        <svg className="hero-outline" viewBox={HERO_OUTLINE_VIEWBOX} aria-hidden="true">
          <path className="hero-outline-base" d={HERO_OUTLINE_PATH} />
          <path className="hero-outline-trail" d={HERO_OUTLINE_PATH} pathLength="100" />
          <path className="hero-outline-head" d={HERO_OUTLINE_PATH} pathLength="100" />
        </svg>
      </div>

      <span className="hero-chip hero-chip-status">
        <span className="status-dot" aria-hidden="true" />
        Open to internships
      </span>

      <span className="hero-chip hero-chip-location">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
        </svg>
        RUPP · Phnom Penh
      </span>
    </figure>
  );
}

export default Profile;
