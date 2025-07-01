export default function Home() {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <img 
        src="/main.png" 
        alt="메인 이미지"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center'
        }}
      />
    </div>
  )
} 