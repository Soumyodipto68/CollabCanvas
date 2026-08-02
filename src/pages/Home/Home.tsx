import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Features from "../../components/Features";
import Footer from "../../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;