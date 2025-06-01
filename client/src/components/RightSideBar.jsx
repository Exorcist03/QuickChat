import React, { useContext, useEffect, useState } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext';

const RightSideBar = () => { // only display when selected user

  const {selectedUsers, messages} = useContext(ChatContext);
  const {logout, onlineUser} = useContext(AuthContext);
  const [msgImages, setmsgImages] = useState([]); // will store all the images send by the user

  // now i have to get all the images and set them to the state
  useEffect(() => {
    setmsgImages(
      messages.filter(msg => msg.image).map(msg => msg.image) // firstly filtered the msg with image prop and then got the image and set it to the msgimsge
    )
  }, [messages]);


  return selectedUsers &&  (
    <div className={`bg-[#81585B2]/10 text-white w-full relative overflow-y-scroll ${selectedUsers ? "max-md:hidden" : ""} `}>
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img src={selectedUsers?.profilePic || assets.avatar_icon} alt="" className='w-20 aspect-[1/1] rounded-full ' />
        <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
          {onlineUser.includes(selectedUsers._id) &&  <p className='w-2 h-2 rounded-full bg-green-500'></p>}
          {selectedUsers.fullName}
        </h1>
        <p className='px-10 mx-auto'>{selectedUsers.bio}</p>
      </div>

      <hr className='border-[#ffffff50] my-4 ' />

      <div className='px-5 text-xs'>
        <p>Media</p>
        <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80 '>
          {msgImages.map((url, index) => (
            <div key={index} onClick={() => {window.open(url)}} className='cursor-pointer rounded'>
              <img src={url} alt="" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={logout} className='absolute bottom-5 left-1/2 transforn -translate-x-1/2  bg-gradient-to-r from-purple-500 to-violet-500 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer'>
        Logout
      </button>
    </div>
  )
}

export default RightSideBar
