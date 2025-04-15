import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import AnimatedSection from '../components/ui/AnimatedSection';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '../utils/animationVariants';

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
      {/* Hero Section - Compact */}
      <section className="bg-primary text-white py-4">
        <div className="container">
          <div className="row align-items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInLeft}
              transition={{ duration: 0.5 }}
              className="col-lg-7 py-3"
            >
              <h1 className="display-5 fw-bold mb-3">Our Story</h1>
              <p className="lead mb-0">Founded in 2018, PeakHive has grown from a small startup to a trusted destination for technology enthusiasts.</p>
            </motion.div>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInRight}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-lg-5"
            >
              <img 
                src="https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Team meeting" 
                className="img-fluid rounded shadow-lg"
                style={{maxHeight: "250px", objectFit: "cover"}}
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Mission - Condensed */}
      <AnimatedSection className="py-4" delay={0.3}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="fw-bold mb-3 fs-3">Our Mission</h2>
              <p className="mb-4">At PeakHive, we believe that premium technology should be accessible to everyone. We curate high-quality tech products and deliver them with exceptional service and competitive pricing.</p>
              
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="row g-3 mt-2"
              >
                <motion.div variants={fadeInUp} className="col-md-4">
                  <motion.div 
                    className="card border-0 shadow-sm h-100"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="card-body text-center p-3">
                      <div className="fs-3 text-primary mb-2">
                        <i className="bi bi-award"></i>
                      </div>
                      <h5 className="fw-bold fs-6">Quality First</h5>
                      <p className="mb-0 small">We carefully select each product to ensure the highest quality standards.</p>
                    </div>
                  </motion.div>
                </motion.div>
                <motion.div variants={fadeInUp} className="col-md-4">
                  <motion.div 
                    className="card border-0 shadow-sm h-100"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="card-body text-center p-3">
                      <div className="fs-3 text-primary mb-2">
                        <i className="bi bi-currency-dollar"></i>
                      </div>
                      <h5 className="fw-bold fs-6">Fair Pricing</h5>
                      <p className="mb-0 small">We work directly with manufacturers to offer competitive prices.</p>
                    </div>
                  </motion.div>
                </motion.div>
                <motion.div variants={fadeInUp} className="col-md-4">
                  <motion.div 
                    className="card border-0 shadow-sm h-100"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="card-body text-center p-3">
                      <div className="fs-3 text-primary mb-2">
                        <i className="bi bi-headset"></i>
                      </div>
                      <h5 className="fw-bold fs-6">Customer Focus</h5>
                      <p className="mb-0 small">We're committed to providing exceptional customer service and support.</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Team - Optimized */}
      <AnimatedSection className="py-4 bg-light" delay={0.4}>
        <div className="container">
          <h2 className="fw-bold text-center mb-4 fs-3">Meet Our Team</h2>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="row g-3"
          >
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp} 
                className="col-sm-6 col-lg-3"
              >
                <motion.div 
                  className="card border-0 shadow-sm h-100"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <img 
                    src={member.image} 
                    className="card-img-top" 
                    alt={member.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <div className="card-body p-3">
                    <h5 className="fw-bold mb-1 fs-6">{member.name}</h5>
                    <p className="text-primary mb-2 small">{member.position}</p>
                    <p className="card-text small">{member.bio}</p>
                  </div>
                  <div className="card-footer bg-white border-0 py-2 d-flex justify-content-center gap-3">
                    <a href="#" className="text-muted"><i className="bi bi-linkedin"></i></a>
                    <a href="#" className="text-muted"><i className="bi bi-twitter"></i></a>
                    <a href="#" className="text-muted"><i className="bi bi-envelope"></i></a>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>
      
      {/* Stats - Compact */}
      <AnimatedSection className="py-4" delay={0.5}>
        <div className="container">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="row g-3 text-center"
          >
            <motion.div variants={fadeInUp} className="col-6 col-md-3">
              <div className="fs-2 fw-bold text-primary mb-1">5+</div>
              <p className="mb-0">Years in Business</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="col-6 col-md-3">
              <div className="fs-2 fw-bold text-primary mb-1">25k+</div>
              <p className="mb-0">Happy Customers</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="col-6 col-md-3">
              <div className="fs-2 fw-bold text-primary mb-1">500+</div>
              <p className="mb-0">Products</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="col-6 col-md-3">
              <div className="fs-2 fw-bold text-primary mb-1">48</div>
              <p className="mb-0">States Served</p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>
      
      {/* Call to Action - Streamlined */}
      <AnimatedSection className="py-4 bg-dark text-white text-center" delay={0.6}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-2 fs-4">Ready to experience PeakHive?</h2>
              <p className="mb-3">Find your perfect tech products today.</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/products" className="btn btn-primary px-4 py-2">Shop Now</Link>
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}

export default About; 