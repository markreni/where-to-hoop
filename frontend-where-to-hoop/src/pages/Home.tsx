import Footer from "../components/Footer.tsx";


const Home = () => {
  
  return (
    <div className="padding-for-nav-bar h-screen flex flex-col justify-center poppins-medium text-[min(8vw,2.0rem)] text-white text-center">
      <div className="flex-grow space-y-6 px-4">
        <section>
          Welcome to <strong>WhereHoops</strong>!<br />
          Find basketball hoops near you.<br />
        </section>
        <section> 
          Please enable location services for better experience with the web service.
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Home;