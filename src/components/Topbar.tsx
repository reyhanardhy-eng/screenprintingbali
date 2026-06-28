import Image from "next/image";

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <a href="#" className="logo">
          <Image
            src="/images/spb_logo_nav.png"
            alt="Screenprinting Bali"
            className="logo__mark"
            width={34}
            height={34}
          />
          <span className="logo__text">
            <span>Screenprinting</span>
            <span>Bali / Studio</span>
          </span>
        </a>
        <nav className="nav">
          <a href="#methods">Methods</a>
          <a href="#calculator">Price calculator</a>
          <a href="#work">Work</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a
          href="https://wa.me/6283174145415?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20a%20print%20order"
          target="_blank"
          rel="noopener"
          className="btn btn--small"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.6 6.32A7.8 7.8 0 0 0 12.05 4a7.85 7.85 0 0 0-6.78 11.78L4 20l4.31-1.13a7.85 7.85 0 0 0 3.74.95h.01a7.85 7.85 0 0 0 5.55-13.5ZM12.06 18.5h-.01a6.5 6.5 0 0 1-3.32-.91l-.24-.14-2.46.64.66-2.4-.15-.25a6.52 6.52 0 1 1 12.06-3.45 6.52 6.52 0 0 1-6.54 6.5Zm3.57-4.87c-.2-.1-1.17-.57-1.35-.64-.18-.07-.31-.1-.45.1-.13.2-.5.64-.62.77-.11.13-.23.15-.43.05-.2-.1-.83-.31-1.58-.97a5.9 5.9 0 0 1-1.09-1.36c-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.45-1.09-.62-1.49-.16-.39-.33-.34-.45-.34l-.39-.01a.74.74 0 0 0-.54.25c-.18.2-.7.69-.7 1.68 0 .99.72 1.95.82 2.08.1.14 1.42 2.17 3.45 3.05.48.2.86.33 1.15.42.48.15.92.13 1.27.08.39-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.39-.23Z" />
          </svg>
          WhatsApp
        </a>
      </div>
    </header>
  );
}
