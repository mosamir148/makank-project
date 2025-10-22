import Category from '../../components/Home/Category/Category'
import Hero from '../../components/Home/Hero/Hero'
import Sales from '../../components/Home/Sales/Sales'
import  './Home.css'
import Special from '../../components/Home/Special/Special'
import Online from '../../components/Home/Online/Online'
import Arrival from '../../components/Home/Arrival/Arrival'
import Faq from '../../components/Home/Faq/Faq'
import Customer from '../../components/Home/Customer/Customer'
import Why from '../../components/Home/Why/Why'
import Offer from '../../components/Home/Offer/Offer'
import Testimonials from '../../components/Home/Testimonials/Testimonials'
import Newsletter from '../../components/Home/Newsletter/Newsletter'

const Home = () => {
  return (
   <>
      <Hero />
      <Category />
      <Offer />
      <Special />
      <Online />
      <Sales />
      <Arrival />
      <Faq />
      <Testimonials />
      <Customer />
      <Why />
      <Newsletter />
   </>
  )
}

export default Home