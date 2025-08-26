import { useEffect, useState } from "react";
import "../styles/css/AvatarLogin.css";

const AvatarLogin = () => {
  // === ตำแหน่งเกิดแบบสุ่มทันทีที่เริ่ม ===
  const getRandomPosition = () => {
    const screenWidth = window.innerWidth - 100; // กันออกขอบจอ
    const screenHeight = window.innerHeight - 100;
    return {
      top: Math.floor(Math.random() * screenHeight),
      left: Math.floor(Math.random() * screenWidth),
    };
  };

  const [position, setPosition] = useState(getRandomPosition);

  useEffect(() => {
    const moveRandom = () => {
      setPosition(getRandomPosition());
    };

    // ทุก 2 วิ จะสุ่มไปตำแหน่งใหม่
    const interval = setInterval(moveRandom, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="character-wrapper"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        transition: "all 1.5s ease-in-out",
      }}
    >
      <div className="character">
        <div className="eye left">
          <div className="pupil left"></div>
        </div>
        <div className="eye right">
          <div className="pupil right"></div>
        </div>
      </div>
      <svg
        width="110"
        height="50"
        viewBox="0 0 250 100"
        className="smile"
      >
        <path
          d="M 20 85 Q 150 115 235 30"
          fill="none"
          stroke="#b3e6fa"
          strokeWidth="30"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default AvatarLogin;
