import React from 'react';
import Link from "next/link";
import {Search} from "lucide-react";
import {ProfileIcon} from "../../assets/svgs/ProfileIcon"

const Header = () => {
    return (
        <div className='w-full bg-white'>
            <div className='w-[80%] py-5 m-auto flex items-center justify-between'>
                <div>
                    <Link href={"/"}>
                        <span className="text-2xl font-600 ">Eshop</span>
                    </Link>
                </div>
                <div className='w-[50%] relative' >
                    <input type="text" placeholder="Search for products"
                           className='w-full px-4 font-Poppins font-medium border-[2.5px] border-[blue] outline-none h-[55px]'/>
                    <div className='w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[blue] absolute top-0 right-0' >
                        <Search color="white"/>
                    </div>
                    <div className="flex items-center gap-8">
                        <Link href={"/login"}>
                            <ProfileIcon/>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
