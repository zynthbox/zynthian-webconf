import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
const SoundEditor = () => {    
    const dispatch = useDispatch();    
    const { soundSelected } = useSelector((state) => state.soundmanager);
  return (                        
            <div>
                sound detail
                {soundSelected}
            </div>                                                                                         
  )
}
export default SoundEditor

