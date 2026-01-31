"use client";
import React, {useEffect, useState} from 'react';

const HeaderBottom = () => {
    const [show, setShow] = useState(false)
    const [isSticky, setIsSticky] = useState(false)

    useEffect(()=>{
        const handleScroll = () =>{
            if (window.screenY > 100){
                setIsSticky(true)
            }else {
                setIsSticky(false)
            }
            window.addEventListener('scroll', handleScroll)
            return ()=> window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div className={`w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0  z-[100] bg-white shadow-lg"
            : "relative"} `}>
            <div className={`w-[80%] relative m-auto flex items-center justify-between ${
                isSticky ? "pt-3" : "py-0"
            }`}>
                {/*All dropdowns*/}

            </div>
        </div>
    );
};

export default HeaderBottom;
