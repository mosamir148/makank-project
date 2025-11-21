import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
import { BASE_URL } from '../assets/url'

export const userContext = createContext({})

const UserContextProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUser = async()=>{
        try{
            // Use validateStatus to treat 401 as non-error (expected when not authenticated)
            const res = await axios.get(`${BASE_URL}/user/refetch`, {
                withCredentials: true,
                validateStatus: (status) => status === 200 || status === 401
            });
            
            if (res.status === 401) {
                setUser(null);
            } else {
                setUser(res.data);
            }
        }catch (err) {
            // Suppress 401 errors in console - they're expected when user is not logged in
            if (err.response?.status === 401) {
                setUser(null);
            } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                // Server is not running - handle gracefully without logging
                setUser(null);
            }
            // Silently handle other errors (connection refused, etc.)
        } finally {
            setLoading(false);
        }
        };

    useEffect(()=>{
        getUser()
    },[])

  return (
    <userContext.Provider value={{user, setUser, getUser, loading}}>
      {children}
    </userContext.Provider>
  )
}

export default UserContextProvider