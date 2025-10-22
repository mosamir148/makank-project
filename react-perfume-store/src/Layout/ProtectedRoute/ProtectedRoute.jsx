import { useContext } from 'react'
import { userContext } from '../../context/UserContext'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ allowedRoles }) => {
    const {user} = useContext(userContext)

    if(!user) return <Navigate  to={"/"}/>

    if(!allowedRoles.includes(user.role)){
        return <Navigate  to={"/"} />
    }

  return <Outlet />
}

export default ProtectedRoute