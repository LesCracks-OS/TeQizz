import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
  return (
    <div className="relative min-h-screen bg-[#080808]">
      {/* Le Header gère son propre placement fixe et ses marges */}
      <Header />

      {/* On ajoute un padding top ici pour que le contenu ne soit jamais caché sous le header */}
      <main>
        <Outlet />
      </main>

      {/* Le Footer gère son propre espacement */}
      <Footer />
    </div>
  );
};

export default MainLayout;
