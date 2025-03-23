import React from 'react';

function About() {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      position: 'CEO & Founder',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      bio: 'With over 15 years of experience in the tech industry, Sarah founded PeakHive with a mission to make premium technology accessible to everyone.'
    },
    {
      name: 'Michael Chen',
      position: 'CTO',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      bio: 'Michael leads our technical team, ensuring that we stay at the cutting edge of e-commerce technology and deliver a seamless shopping experience.'
    },
    {
      name: 'David Rodriguez',
      position: 'Head of Product',
      image: 'https://randomuser.me/api/portraits/men/22.jpg',
      bio: 'David oversees our product catalog, working directly with manufacturers to bring you the best selection of tech products at competitive prices.'
    },
    {
      name: 'Emily Taylor',
      position: 'Customer Experience Manager',
      image: 'https://randomuser.me/api/portraits/women/26.jpg',
      bio: 'Emily ensures that every interaction with PeakHive exceeds your expectations, from browsing our site to receiving your order.'
    }
  ];
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container-fluid px-4 px-md-5">
          <div className="row align-items-center">
            <div className="col-lg-6 py-4">
              <h1 className="display-4 fw-bold mb-4">Our Story</h1>
              <p className="lead mb-0">Founded in 2018, PeakHive has grown from a small startup to a trusted destination for technology enthusiasts across the country.</p>
            </div>
            <div className="col-lg-6">
              <img 
                src="https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Team meeting" 
                className="img-fluid rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="fw-bold mb-4">Our Mission</h2>
              <p className="lead mb-5">At PeakHive, we believe that premium technology should be accessible to everyone. Our mission is to curate high-quality tech products and deliver them to your doorstep with exceptional service and competitive pricing.</p>
              
              <div className="row g-4 mt-3">
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center p-4">
                      <div className="display-5 text-primary mb-3">
                        <i className="bi bi-award"></i>
                      </div>
                      <h5 className="fw-bold">Quality First</h5>
                      <p className="mb-0">We carefully select each product in our catalog to ensure the highest quality standards.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center p-4">
                      <div className="display-5 text-primary mb-3">
                        <i className="bi bi-currency-dollar"></i>
                      </div>
                      <h5 className="fw-bold">Fair Pricing</h5>
                      <p className="mb-0">We work directly with manufacturers to offer competitive prices without compromising quality.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body text-center p-4">
                      <div className="display-5 text-primary mb-3">
                        <i className="bi bi-headset"></i>
                      </div>
                      <h5 className="fw-bold">Customer Focus</h5>
                      <p className="mb-0">We're committed to providing exceptional customer service and support.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">Meet Our Team</h2>
          
          <div className="row g-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100">
                  <img 
                    src={member.image} 
                    className="card-img-top" 
                    alt={member.name}
                    style={{ height: '250px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="fw-bold mb-1">{member.name}</h5>
                    <p className="text-primary mb-3">{member.position}</p>
                    <p className="card-text">{member.bio}</p>
                  </div>
                  <div className="card-footer bg-white border-0 d-flex justify-content-center gap-3">
                    <a href="#" className="text-muted fs-5"><i className="bi bi-linkedin"></i></a>
                    <a href="#" className="text-muted fs-5"><i className="bi bi-twitter"></i></a>
                    <a href="#" className="text-muted fs-5"><i className="bi bi-envelope"></i></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="display-3 fw-bold text-primary mb-2">5+</div>
              <p className="lead">Years in Business</p>
            </div>
            <div className="col-md-3">
              <div className="display-3 fw-bold text-primary mb-2">25k+</div>
              <p className="lead">Happy Customers</p>
            </div>
            <div className="col-md-3">
              <div className="display-3 fw-bold text-primary mb-2">500+</div>
              <p className="lead">Products</p>
            </div>
            <div className="col-md-3">
              <div className="display-3 fw-bold text-primary mb-2">48</div>
              <p className="lead">States Served</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-5 bg-dark text-white text-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-3">Ready to experience PeakHive?</h2>
              <p className="lead mb-4">Browse our catalog of premium tech products and find your perfect match.</p>
              <a href="/products" className="btn btn-primary btn-lg px-4 py-2">Shop Now</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About; 