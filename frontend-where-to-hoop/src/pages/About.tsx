import { BackArrow } from "../components/reusable/BackArrow";

const About = () => {

  return (
    <div className="p-4 mb-4 bg-light rounded-3">
        <h1 className="display-6 mb-2">About NatureDiary</h1>
        <p className="lead text-muted">
          NatureDiary is a community-driven platform for recording and
          sharing observations of wildlife, plants and fungi. Contribute
          photos, pin exact locations on the map, request identification
          help from the community, and explore public discoveries near you.
        </p>

        <p className="text-muted">
          Our mission is to make it easy for everyone to connect with
          nature and help build an open record of biodiversity. We value
          accurate reporting, respectful collaboration, and privacy — you
          control which observations are public.
        </p>
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
  );
};

export default About;
