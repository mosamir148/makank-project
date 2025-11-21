import { useContext } from 'react'
import { userContext } from '../../context/UserContext'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ allowedRoles }) => {
    const {user} = useContext(userContext)

    if(!user) return <Navigate  to="/unauthenticated" replace/>

    if(!allowedRoles.includes(user.role)){
        return <Navigate  to="/unauthenticated" replace />
    }

  return <Outlet />
}

export default ProtectedRoute