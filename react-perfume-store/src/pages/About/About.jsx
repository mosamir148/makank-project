import './About.css';
import { useLang } from "../../context/LangContext";

const About = () => {
  const { t } = useLang(); 

  return (
    <div className='about'>
      {/* About Banner */}
      <section className="about-banner">
        <div className="container">
          <h1 data-aos="fade-up">{t("aboutBannerTitle")}</h1>
          <p data-aos="fade-up" data-aos-delay="100">{t("aboutBannerSubtitle")}</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container abouts">
          <div data-aos="fade-right">
            <h2>{t("aboutStoryTitle")}</h2>
            <p>{t("aboutStoryP1")}</p>
            <p>{t("aboutStoryP2")}</p>
            <p>{t("aboutStoryP3")}</p>
          </div>
          <div data-aos="fade-left">
            <div style={{ 
              height: '500px', 
              background: 'url("https://images.unsplash.com/photo-1541643600914-78b084683601?w=800") center/cover', 
              borderRadius: '20px', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' 
            }}></div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t("aboutValuesTitle")}</h2>
            <p className="section-subtitle">{t("WhyChooseUsSub")}</p>
          </div>
          <div className="values-grid">
            <div className="value-card" data-aos="zoom-in">
              <div>✨</div>
              <h3>{t("valueQuality")}</h3>
              <p>{t("QualityGuaranteeSub")}</p>
            </div>
            <div className="value-card" data-aos="zoom-in" data-aos-delay="100">
              <div>🎯</div>
              <h3>{t("valueAuthenticity")}</h3>
              <p>{t("QualityGuaranteeSub")}</p>
            </div>
            <div className="value-card" data-aos="zoom-in" data-aos-delay="200">
              <div>💎</div>
              <h3>{t("valueLuxury")}</h3>
              <p>{t("LuxuryPackagingSub")}</p>
            </div>
            <div className="value-card" data-aos="zoom-in" data-aos-delay="300">
              <div>🤝</div>
              <h3>{t("valueTrust")}</h3>
              <p>{t("CustomerSupportSub")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section">
        <div className="container abouts" >
          <div data-aos="fade-right">
            <div style={{ 
              height: '500px', 
              background: 'url("https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800") center/cover', 
              borderRadius: '20px', 
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' 
            }}></div>
          </div>
          <div data-aos="fade-left">
            <h2>{t("aboutVisionTitle")}</h2>
            <p>{t("aboutVisionP1")}</p>
            <p>{t("aboutVisionP2")}</p>
            <p>{t("aboutVisionP3")}</p>
          </div>
        </div>
      </section>

      {/* Numbers Section */}
      <section className="numbers-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: '#fff' }}>{t("aboutNumbersTitle")}</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>{t("CustomerReviewsSub")}</p>
          </div>
          <div className="numbers-grid">
            <div data-aos="fade-up">
              <div>15+</div>
              <p>{t("numberYearsExperience")}</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
              <div>50K+</div>
              <p>{t("numberHappyClients")}</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <div>500+</div>
              <p>{t("numberLuxuryPerfumes")}</p>
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
              <div>100%</div>
              <p>{t("numberAuthenticProducts")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t("aboutTeamTitle")}</h2>
            <p className="section-subtitle">{t("CustomerReviewsSub")}</p>
          </div>
          <div className="team-grid">
            <div className="team-member" data-aos="zoom-in">
              <div style={{ backgroundImage: 'url("https://i.pravatar.cc/200?img=12")' }}></div>
              <h3>Mohammed Al-Ahmad</h3>
              <p className="role">{t("teamCEO")}</p>
              <p className="bio">{t("teamCEODesc")}</p>
            </div>
            <div className="team-member" data-aos="zoom-in" data-aos-delay="100">
              <div style={{ backgroundImage: 'url("https://i.pravatar.cc/200?img=5")' }}></div>
              <h3>Sarah Ali</h3>
              <p className="role">{t("teamPurchasingManager")}</p>
              <p className="bio">{t("teamPurchasingDesc")}</p>
            </div>
            <div className="team-member" data-aos="zoom-in" data-aos-delay="200">
              <div style={{ backgroundImage: 'url("https://i.pravatar.cc/200?img=33")' }}></div>
              <h3>Khalid Al-Saeed</h3>
              <p className="role">{t("teamPerfumeExpert")}</p>
              <p className="bio">{t("teamPerfumeExpertDesc")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
