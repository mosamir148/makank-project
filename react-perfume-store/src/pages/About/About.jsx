import './About.css';

const About = () => {
  return (
    <div className='about'>
      {/* About Banner */}

      <section className="about-banner">
        <div className="container">
          <h1 data-aos="fade-up">About Us</h1>
          <p data-aos="fade-up" data-aos-delay="100">
            A journey through the world of luxury perfumes and elegance
          </p>
        </div>
      </section>

      {/* Story Section */}

      <section className="story-section">
        <div className="container abouts">
          <div data-aos="fade-right">
            <h2>Our Story</h2>
            <p>
              LUXE PARFUM started in 2010 with a clear vision: bringing the finest global perfumes to the Arab market.
              We believe perfume is not just a scent, but an expression of personality, elegance, and refined taste.
            </p>
            <p>
              Over the years, we have built strong relationships with the most famous French, Italian, and Eastern perfume houses,
              allowing us to offer an exclusive and diverse collection of luxury fragrances.
            </p>
            <p>
              Today, we proudly serve thousands of clients across the region, continuing our commitment to quality, authenticity, and premium service.
            </p>
          </div>
          <div data-aos="fade-left">
            <div style={{ height: '500px', background: 'url("https://images.unsplash.com/photo-1541643600914-78b084683601?w=800") center/cover', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}></div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle">Principles we believe in</p>
          </div>
          <div className="values-grid">
            <div className="value-card" data-aos="zoom-in">
              <div>✨</div>
              <h3>Quality</h3>
              <p>We provide 100% authentic products from the finest global brands</p>
            </div>
            <div className="value-card" data-aos="zoom-in" data-aos-delay="100">
              <div>🎯</div>
              <h3>Authenticity</h3>
              <p>Every product comes with a certificate of authenticity and quality</p>
            </div>
            <div className="value-card" data-aos="zoom-in" data-aos-delay="200">
              <div>💎</div>
              <h3>Luxury</h3>
              <p>A premium shopping experience from selection to packaging and delivery</p>
            </div>
            <div className="value-card" data-aos="zoom-in" data-aos-delay="300">
              <div>🤝</div>
              <h3>Trust</h3>
              <p>We build long-term relationships with clients based on trust and transparency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}

      <section className="vision-section">
        <div className="container abouts" >
          <div data-aos="fade-right">
            <div style={{ height: '500px', background: 'url("https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800") center/cover', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}></div>
          </div>
          <div data-aos="fade-left">
            <h2>Our Vision</h2>
            <p>
              We aim to be the number one destination for luxury perfume lovers in the Arab region,
              providing an exceptional shopping experience combining quality, authenticity, and premium service.
            </p>
            <p>
              We strive to promote a culture of refined fragrances and introduce our clients to the finest global releases,
              while preserving authentic Eastern perfume heritage.
            </p>
            <p>
              We believe everyone deserves to find their perfect fragrance that reflects their personality and unique style.
            </p>
          </div>
        </div>
      </section>

      {/* Numbers Section */}
      <section className="numbers-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: '#fff' }}>Our Numbers</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>Our achievements in numbers</p>
          </div>
          <div className="numbers-grid">
            <div data-aos="fade-up">
              <div>15+</div>
              <p>Years of Experience</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
              <div>50K+</div>
              <p>Happy Clients</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <div>500+</div>
              <p>Luxury Perfumes</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
              <div>100%</div>
              <p>Authentic Products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Team</h2>
            <p className="section-subtitle">Meet our perfume experts</p>
          </div>
          <div className="team-grid">
            <div className="team-member" data-aos="zoom-in">
              <div style={{ backgroundImage: 'url("https://i.pravatar.cc/200?img=12")' }}></div>
              <h3>Mohammed Al-Ahmad</h3>
              <p className="role">CEO</p>
              <p className="bio">20 years of experience in the perfume industry</p>
            </div>
            <div className="team-member" data-aos="zoom-in" data-aos-delay="100">
              <div style={{ backgroundImage: 'url("https://i.pravatar.cc/200?img=5")' }}></div>
              <h3>Sarah Ali</h3>
              <p className="role">Purchasing Manager</p>
              <p className="bio">Specialist in French perfumes</p>
            </div>
            <div className="team-member" data-aos="zoom-in" data-aos-delay="200">
              <div style={{ backgroundImage: 'url("https://i.pravatar.cc/200?img=33")' }}></div>
              <h3>Khalid Al-Saeed</h3>
              <p className="role">Perfume Expert</p>
              <p className="bio">Specialist in Eastern perfumes</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
