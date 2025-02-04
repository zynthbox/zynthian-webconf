import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { store } from '../../store/store'
import { Provider } from 'react-redux'

export default function RootLayout() {
  return (
    <Provider store={store}>
        <a href="#m" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Tools <span className="caret"></span></a>
        <ul className="dropdown-menu">
           <li>
            <NavLink to="sound-manager"> Sound Manager </NavLink>                   
            </li>
            <li>
            <NavLink to="sketchpad-manager"> Sketchpad Manager </NavLink>
            </li>
            <li>
            <NavLink to="file-manager"> File manager </NavLink>
            </li>
           
            <li>
            <NavLink to="sample-manager"> Sample Manager </NavLink>              
            </li>
            <li>
            <NavLink to="track-manager"> Track Manager </NavLink>              
            </li>
            <li>
            <NavLink to="sound-manager-old"> Sound Manager old</NavLink>                   
            </li>
            <li>
            <NavLink to="sketchpad-xtractor"> SketchPad Xtractor </NavLink>     
            </li>
            <li>
            <NavLink to="song-export"> Song Export </NavLink>    
            </li>
        </ul>             
        <Outlet />      
    </Provider>
  )
}
