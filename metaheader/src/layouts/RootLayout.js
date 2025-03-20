import React, { useEffect} from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { store } from '../../store/store'
import { Provider } from 'react-redux'
import Toolbar from '../app/components/Toolbar'


export default function RootLayout() {
  const location = useLocation();
  const showToolbarRoutes = ["/sound-manager", "/sketchpad-manager", "/file-manager", "/sample-manager"]; 
  return (
    <Provider store={store}>
        <a href="#m" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Tools <span className="caret"></span></a>
        <ul className="dropdown-menu">
           <li>
            <NavLink to="file-manager"> File manager </NavLink>
            </li>
            <li>
            <NavLink to="sketchpad-manager"> Sketchpad Manager </NavLink>
            </li>
            
           <li>
            <NavLink to="sound-manager"> Sound Manager </NavLink>                   
            </li>                      
            <li>
            <NavLink to="sample-manager"> Sample Manager </NavLink>              
            </li>
            <li>
             -- OLD --
            </li>
            <li>
            <NavLink to="track-manager"> Track Manager </NavLink>              
            </li>
            
            <li>
            <NavLink to="sound-manager-old"> Favorites</NavLink>                   
            </li>
            <li>
            <NavLink to="sketchpad-xtractor"> SketchPad Xtractor </NavLink>     
            </li>
            <li>
            <NavLink to="song-export"> Song Export </NavLink>    
            </li>
        </ul>      
        {showToolbarRoutes.includes(location.pathname) && <Toolbar />}
        <Outlet />      
    </Provider>
  )
}
