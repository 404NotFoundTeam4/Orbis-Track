
import "../styles/css/AvatarLogin.css"
const AvatarLogin = () => {
  return ( 
      <div className="denso">
    <div className="character">
      <div className="eye left"><div className="pupil left"></div></div>
      <div className="eye right"><div className="pupil right"></div></div>
    </div>
    <svg width="110" height="50" viewBox="0 0 250 100" className="smile">
      <path d="M 20 85 Q 150 115 235 30" fill="none" stroke="#b3e6fa" stroke-width="30" stroke-linecap="round"/>
    </svg>
  </div>
   
  )
}

export default AvatarLogin