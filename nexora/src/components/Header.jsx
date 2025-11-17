import logo from '../assets/Proplus Data Logo - Horizontal Transparent (1).png';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="brand">
          <img src={logo} alt="Proplus Data" className="brand-logo" />
          <span className="brand-sep">|</span>
          <div className="brand-text">
            <h1 className="title">Nexora®</h1>
            <p className="tagline">Insights Beyond Numbers</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;