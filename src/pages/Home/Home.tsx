import { Features } from "../../components/ui/Features";
import { Footer } from "../../components/ui/Footer";
import { Hero } from "../../components/ui/Hero";
import { Navbar } from "../../components/ui/Navbar";


const Home = () => {
  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <Navbar />
      <Hero />
      <Features/>
      <Footer/>
    </div>
  );
};


export default Home;