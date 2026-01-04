import Footer from "../components/Footer.tsx";


const Home = () => {
  
  return (
    <div className="padding-for-nav-bar h-screen flex flex-col justify-center poppins-medium text-[min(8vw,2.0rem)] text-white text-center">
      <div className="flex-grow space-y-6 px-4">
        <section>
          Welcome to <strong>Let's Hoop!</strong>!<br />
          From a basketball lover to a basketball lover.<br />
          - Find basketball hoops near you.<br />
          - Let other hoopers know that you are going to that particular hoop to play.<br />
          - Find new hooping buddies!<br />
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