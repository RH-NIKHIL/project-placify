import 'boxicons/css/boxicons.min.css';
import { Link } from "react-router-dom";

const Header = () => {
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    const mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.remove("hidden");
    } else {
      mobileMenu.classList.add("hidden");
    }
  };

  return (
    <header className="flex justify-between items-center py-4 lg:px-20">
      <h1
        data-aos="fade-down"
        data-aos-easing="linear"
        data-aos-duration="1500"
        className="text-3xl md:text-4xl lg:text-5xl font-light m-0"
      >
        PLACIFY
      </h1>

      <nav className="hidden md:flex items-center gap-12">
        {/* HOME link updated to use Router */}
        <Link
          to="/"
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="1000"
          className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
        >
          HOME
        </Link>

        <Link
          to="/features"
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="1300"
          className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
        >
          FEATURES
        </Link>

        <Link
          to="/contact"
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="1600"
          className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
        >
          CONTACT US
        </Link>

        <Link
          to="/aboutus"
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="1900"
          className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
        >
          ABOUT US
        </Link>
      </nav>

      {/* Sign In Button */}
      <Link
        to="/signin"
        className="hidden md:block bg-[#a7a7a7] text-black py-3 px-8 rounded-full border-none font-medium transition-all duration-500 hover:bg-white cursor-pointer z-50"
      >
        SIGN IN
      </Link>

      {/* Mobile Menu Button */}
      <button onClick={toggleMobileMenu} className="md:hidden text-3xl p-2 z-50">
        <i className="bx bx-menu"></i>
      </button>

      {/* Mobile Menu */}
      <div
        id="mobileMenu"
        className="hidden fixed top-16 bottom-0 right-0 left-0 p-5 md:hidden z-40 bg-opacity-70 backdrop-blur-md"
      >
        <nav className="flex flex-col gap-6 items-center">
          <Link
            to="/"
            className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
          >
            HOME
          </Link>
          <a className="text-base tracking-wider transition-colors hover:text-gray-300 z-50" href="#">
            FEATURES
          </a>
          <Link
            to="/contact"
            className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
          >
            CONTACT US
          </Link>
          <a className="text-base tracking-wider transition-colors hover:text-gray-300 z-50" href="#">
            RESOURCES
          </a>
          <a className="text-base tracking-wider transition-colors hover:text-gray-300 z-50" href="#">
            DOCS
          </a>
          <Link
            to="/signin"
            className="bg-[#a7a7a7] text-black py-2 px-6 rounded-full font-medium transition-all duration-500 hover:bg-white cursor-pointer"
          >
            SIGN IN
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
