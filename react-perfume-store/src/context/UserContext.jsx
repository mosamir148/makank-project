import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
import { BASE_URL } from '../assets/url'

export const userContext = createContext({})

const UserContextProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUser = async()=>{
        try{
            const res = await axios.get(`${BASE_URL}/user/refetch`, {withCredentials: true})
            setUser(res.data)
        }catch (err) {
            if (err.response && err.response.status === 401) {
                setUser(null);
            } else {
                console.error("Error fetching user:", err);
            }
        } finally {
            setLoading(false);
        }
        };

    useEffect(()=>{
        getUser()
    },[])

  return (
    <>  
        {loading ?  <h1>Loading</h1> :
        <userContext.Provider value={{user,setUser,getUser}}>
            {children}
        </userContext.Provider>}
    </>
  )
}

export default UserContextProvider