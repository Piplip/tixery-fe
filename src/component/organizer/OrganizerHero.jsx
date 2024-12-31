import '../../styles/organizer-hero-styles.css'

function OrganizerHero(){
    return (
        <section className="hero-organizer">
            <div className="hero-organizer__content">
                <h1 className="hero-organizer__title">Host Events Effortlessly</h1>
                <p className="hero-organizer__subtitle">
                    Join <span className="hero-organizer__highlight">TIXERY</span> to create, manage, and sell
                    tickets for your events.
                    Start now and enjoy our <strong>free first event offer!</strong>
                </p>
                <div className="hero-organizer__actions">
                    <button className="hero-organizer__cta-button">
                        Get Started for Free
                    </button>
                    <button className="hero-organizer__cta-button">
                        Learn More
                    </button>
                </div>
            </div>
            <div className="hero-organizer__visual">
                <div className="hero-organizer__visual-circle"></div>
                <img
                    src="https://4.imimg.com/data4/WE/YY/MY-13164308/event-management-service.jpg"
                    alt="Organizing events made easy"
                    className="hero-organizer__image"
                />
            </div>
        </section>
    );
}

export default OrganizerHero;