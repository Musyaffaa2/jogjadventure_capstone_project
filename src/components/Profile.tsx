import React from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import Navbar from "./Navbar";

const ProfilePage = () => {
    return ( 
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-300">
        {/* Navbar */}
        <Navbar />

                <div className="bg-white shadow-lg rounded-lg p-6 w-1/2 mt-24 text-center">
                <div className="flex justify-center mb-4">
                    <span className="text-secondary text-3xl">
                    <FaRegUserCircle />
                    </span>
                </div>
                <h2 className="text-xl font-semibold text-secondary ">Username</h2>
                <p className="text-gray mt-1">aldasyrfa@gmail.com</p>

                <div className="mb-4 mt-5">
                    <label className="block text-gray-700 text-start">Username</label>
                    <input 
                        type="text" 
                        value="Alda Syafira" 
                        className="border border-gray-300 rounded-md p-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-start">Email</label>
                    <input 
                        type="email" 
                        value="aldasyrfa@gmail.com" 
                        className="border border-gray-300 rounded-md p-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-start">Password</label>
                    <input 
                        type="password" 
                        value="1234" 
                        className="border border-gray-300 rounded-md p-2 w-full"
                        placeholder=""
                    />
                </div>

                <button className="mt-4 bg-secondary text-white px-4 py-2 rounded-lg justify-items-end">
                    Edit Profil
                </button>
               
            </div>
        </div>


    );
}

export default ProfilePage;
