import Category from '../../components/Home/Category/Category'
import Hero from '../../components/Home/Hero/Hero'
import Sales from '../../components/Home/Sales/Sales'
import  './Home.css'
import Why from '../../components/Home/Why/Why'
import Testimonials from '../../components/Home/Testimonials/Testimonials'
import Newsletter from '../../components/Home/Newsletter/Newsletter'
import CategoryProducts from '../../components/Home/CategoryProducts/CategoryProducts'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BASE_URL } from '../../assets/url'

const Home = () => {
  const [activeOffers, setActiveOffers] = useState([])

  // Fetch active offers once for all CategoryProducts components
  useEffect(() => {
    const fetchActiveOffers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/offer/active`)
        const offers = res.data.offers || []
        // Filter for discount type only
        const discountOffers = offers.filter(offer => offer.type === "discount")
        setActiveOffers(discountOffers)
      } catch (err) {
        console.log('Error fetching active offers:', err)
        setActiveOffers([])
      }
    }
    fetchActiveOffers()
  }, [])

  return (
   <div className="home-page">
      <Hero />
      <Category />
      <CategoryProducts 
        category="Oud Charcoal"
        categoryKey="oud-charcoal"
        titleAr="فحم العود"
        titleEn="Oud Charcoal"
        activeOffers={activeOffers}
      />
      <CategoryProducts 
        category="Incense"
        categoryKey="incense"
        titleAr="البخور"
        titleEn="Incense"
        activeOffers={activeOffers}
      />
      <CategoryProducts 
        category="Accessories"
        categoryKey="accessories"
        titleAr="الإكسسوارات"
        titleEn="Accessories"
        activeOffers={activeOffers}
      />
      <CategoryProducts 
        category="Offers"
        categoryKey="offers"
        titleAr="العروض"
        titleEn="Offers"
        activeOffers={activeOffers}
      />
      <CategoryProducts 
        category="Perfumes"
        categoryKey="perfumes"
        titleAr="العطور"
        titleEn="Perfumes"
        activeOffers={activeOffers}
      />
      {/* <Sales /> */}
      <Testimonials />
      <Why />
   </div>
  )
}

export default React.memo(Home)