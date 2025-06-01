import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const { messages, selectedUsers, setSelectedUsers, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUser } = useContext(AuthContext);

  // Refs for scrolling
  const scrollContainerRef = useRef(null);
  const scrollEndRef = useRef(null);

  const [input, setInput] = useState('');
  // Track whether we should auto‐scroll on new messages
  const [autoScroll, setAutoScroll] = useState(true);

  // Whenever selectedUsers changes, fetch that chat and re-enable autoScroll
  useEffect(() => {
    if (selectedUsers) {
      getMessages(selectedUsers._id);
      setAutoScroll(true);
    }
  }, [selectedUsers]);

  useEffect(() => {
    if(selectedUsers) {
        getMessages(selectedUsers._id);
    }
  }, [messages])

  // When messages change, only scroll if autoScroll is still true
  useEffect(() => {
    if (autoScroll && scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);


  // If the user manually scrolls, check how far from bottom they are
  const onScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // distance from bottom = scrollHeight - (scrollTop + clientHeight)
    const distanceFromBottom =
      container.scrollHeight - (container.scrollTop + container.clientHeight);

    // If within 50px of bottom, re‐enable autoScroll; otherwise disable it
    if (distanceFromBottom < 50) {
      setAutoScroll(true);
    } else {
      setAutoScroll(false);
    }
  };

  // Handle sending a text message
  const handleSendMessage = async e => {
    e.preventDefault();
    if (input.trim() === '') return;
    await sendMessage({ text: input.trim() });
    setInput('');
    // After sending, we want to see our own message, so re‐enable autoScroll
    setAutoScroll(true);
  };

  // Handle sending an image
  const handleSendImage = async e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = '';
      // Re‐enable autoScroll so we see the newly sent image
      setAutoScroll(true);
    };
    reader.readAsDataURL(file);
  };

  if (!selectedUsers) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
        <img src={assets.logo_icon} className="max-w-16" alt="" />
        <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* ------header------ */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUsers.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUsers.fullName}
          {onlineUser.includes(selectedUsers._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => {
            setSelectedUsers(null);
          }}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />
        <img
          src={assets.help_icon}
          alt=""
          className="max-md:hidden max-w-5"
        />
      </div>

      {/* ------chat area----- */}
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6"
      >
        {messages.map((msg, index) => {
          const isMine = msg.senderId === authUser._id;
          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                isMine ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                  alt="sent-img"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                    isMine ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <div className="text-center text-xs">
                <img
                  src={
                    isMine
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUsers?.profilePic || assets.avatar_icon
                  }
                  alt=""
                  className="w-7 rounded-full"
                />
                <p className="text-gray-500">
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEndRef} />
      </div>

      {/* bottom area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-[#1F1D2B]">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={e => setInput(e.target.value)}
            value={input}
            type="text"
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage(e);
            }}
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          src={assets.send_button}
          onClick={handleSendMessage}
          className="w-7 cursor-pointer"
          alt=""
        />
      </div>
    </div>
  );
};

export default ChatContainer;
