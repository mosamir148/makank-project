import { createContext, useEffect, useState } from 'react'
import axios from 'axios';
import { BASE_URL } from '../assets/url';
export const productsContext = createContext({})

const GetProducts = ({children }) => {
    const [product,setProducts] = useState([])
    
    const AllProduct = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/product`);
            setProducts(res.data.products);
        } catch (err) {
            // Silently handle errors (connection refused, network errors, etc.)
            // Products array will remain empty if fetch fails
            setProducts([]);
        }
    };

    useEffect(() => {
        AllProduct();
    }, []);

  return (
    <productsContext.Provider value={{product,setProducts}}>
        {children }
    </productsContext.Provider>
  )
}

export default GetProducts