import Category from '../../components/Home/Category/Category'
import Hero from '../../components/Home/Hero/Hero'
import Sales from '../../components/Home/Sales/Sales'
import  './Home.css'
import Why from '../../components/Home/Why/Why'
import Testimonials from '../../components/Home/Testimonials/Testimonials'
import Newsletter from '../../components/Home/Newsletter/Newsletter'
import CategoryProducts from '../../components/Home/CategoryProducts/CategoryProducts'
import React from 'react'

const Home = () => {
  return (
   <div className="home-page">
      <Hero />
      <Category />
      <CategoryProducts 
        category="Oud Charcoal"
        categoryKey="oud-charcoal"
        titleAr="فحم العود"
        titleEn="Oud Charcoal"
      />
      <CategoryProducts 
        category="Incense"
        categoryKey="incense"
        titleAr="البخور"
        titleEn="Incense"
      />
      <CategoryProducts 
        category="Accessories"
        categoryKey="accessories"
        titleAr="الإكسسوارات"
        titleEn="Accessories"
      />
      <CategoryProducts 
        category="Offers"
        categoryKey="offers"
        titleAr="العروض"
        titleEn="Offers"
      />
      <CategoryProducts 
        category="Perfumes"
        categoryKey="perfumes"
        titleAr="العطور"
        titleEn="Perfumes"
      />
      {/* <Sales /> */}
      <Testimonials />
      <Why />
   </div>
  )
}

export default React.memo(Home)