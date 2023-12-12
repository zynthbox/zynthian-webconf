import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <>
        <a href="#m" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">More <span className="caret"></span></a>
        <ul className="dropdown-menu">
            <li>
            <NavLink to="file-manager"> File manager</NavLink>
            </li>
            <li>
            <NavLink to="sample-pattern-editor"> Sample {'&'} Pattern Editor </NavLink>              
            </li>
            <li>
            <NavLink to="favorites"> Favorites </NavLink>                   
            </li>
            <li>
            <NavLink to="sketchpad-xtractor"> SketchPad Xtractor </NavLink>     
            </li>
            <li>
            <NavLink to="song-export"> Song Export </NavLink>    
            </li>
        </ul>
        
      <main>
          <Outlet />
      </main>
    </> 
  )
}
