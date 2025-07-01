import { useState, useEffect } from 'react'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 스크롤 진행도 계산 (0~1)
  const maxScroll = 1000 // 1000px 스크롤하면 완료
  const scrollProgress = Math.min(scrollY / maxScroll, 1)
  
  // main.png 불투명도 (스크롤하면 어두워짐)
  const mainOpacity = 1 - scrollProgress
  
  // main2.png 위치 (아래에서 위로)
  const main2TranslateY = (1 - scrollProgress) * 100

  return (
    <>
      {/* 스크롤 가능한 높이 생성 */}
      <div style={{ height: '200vh', position: 'relative' }}>
        
        {/* main.png - 고정된 배경 */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          opacity: mainOpacity
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

        {/* main2.png - 스크롤에 따라 올라오는 이미지 */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2,
          transform: `translateY(${main2TranslateY}vh)`
        }}>
          <img 
            src="/main2.png" 
            alt="두 번째 이미지"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
        </div>
      </div>
    </>
  )
} 