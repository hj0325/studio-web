import { useState, useEffect } from 'react'

// 6개 점선 상자 영역 정의 (화면 비율 기준) - 점선 상자와 정확히 일치하도록 조정
const hoverZones = [
  { x: 12, y: 15, width: 20, height: 28 },   // 01 INSOLE°R
  { x: 40, y: 15, width: 20, height: 28 },   // 02 MealTune  
  { x: 68, y: 15, width: 20, height: 28 },   // 03 PIBIT
  { x: 12, y: 52, width: 20, height: 28 },   // 04 Murmur
  { x: 40, y: 52, width: 20, height: 28 },   // 05 VĀYA
  { x: 68, y: 52, width: 20, height: 28 },   // 06 Closie
]

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [currentPage, setCurrentPage] = useState(null) // null=메인, 'insole', 'mealtune', 'pibit', 'murmur', 'vaya', 'closie'
  const [isBackButtonHovering, setIsBackButtonHovering] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 상자 클릭 핸들러 (모든 상자 대응)
  const handleBoxClick = (e) => {
    const currentScrollProgress = Math.min(scrollY / 1000, 1)
    
    // main2가 거의 올라왔을 때만 클릭 가능 (스크롤 진행도 0.7 이상)
    if (currentScrollProgress < 0.7) return
    
    // 각 상자 영역과 페이지 매핑
    const pageMapping = ['insole', 'mealtune', 'pibit', 'murmur', 'vaya', 'closie']
    
    const currentMain2TranslateY = (1 - currentScrollProgress) * 100
    const main2Top = (currentMain2TranslateY / 100) * window.innerHeight
    const main2Width = window.innerWidth
    const main2Height = window.innerHeight
    
    // 각 상자 영역 체크
    for (let i = 0; i < hoverZones.length; i++) {
      const zone = hoverZones[i]
      const zoneLeft = (zone.x / 100) * main2Width
      const zoneTop = main2Top + (zone.y / 100) * main2Height
      const zoneRight = zoneLeft + (zone.width / 100) * main2Width
      const zoneBottom = zoneTop + (zone.height / 100) * main2Height
      
      if (e.clientX >= zoneLeft && e.clientX <= zoneRight && 
          e.clientY >= zoneTop && e.clientY <= zoneBottom) {
        setCurrentPage(pageMapping[i])
        break
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      
      // 상세 페이지에서는 뒤로가기 버튼 호버 체크만
      if (currentPage) {
        // 뒤로가기 버튼 영역 (왼쪽 상단 70x70 영역)
        const backButtonHover = e.clientX >= 20 && e.clientX <= 90 && 
                               e.clientY >= 20 && e.clientY <= 90
        setIsBackButtonHovering(backButtonHover)
        setIsHovering(false)
        return
      }
      
      const currentScrollProgress = Math.min(scrollY / 1000, 1)
      
      // main2가 거의 올라왔을 때만 호버 감지 (스크롤 진행도 0.7 이상)
      if (currentScrollProgress < 0.7) {
        setIsHovering(false)
        setIsBackButtonHovering(false)
        return
      }

      // main2 영역의 실제 위치 계산
      const currentMain2TranslateY = (1 - currentScrollProgress) * 100
      const main2Top = (currentMain2TranslateY / 100) * window.innerHeight
      const main2Left = 0
      const main2Width = window.innerWidth
      const main2Height = window.innerHeight

      let hovering = false
      
      // 각 호버 영역 체크
      for (let i = 0; i < hoverZones.length; i++) {
        const zone = hoverZones[i]
        const zoneLeft = main2Left + (zone.x / 100) * main2Width
        const zoneTop = main2Top + (zone.y / 100) * main2Height
        const zoneRight = zoneLeft + (zone.width / 100) * main2Width
        const zoneBottom = zoneTop + (zone.height / 100) * main2Height
        
        if (e.clientX >= zoneLeft && e.clientX <= zoneRight && 
            e.clientY >= zoneTop && e.clientY <= zoneBottom) {
          hovering = true
          break // 하나라도 호버되면 break
        }
      }
      
      // 명시적으로 호버 상태 설정
      setIsHovering(hovering)
      setIsBackButtonHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('click', handleBoxClick)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleBoxClick)
    }
  }, [scrollY, currentPage])

  // 스크롤 진행도 계산 (0~1)
  const maxScroll = 1000 // 1000px 스크롤하면 완료
  const scrollProgress = Math.min(scrollY / maxScroll, 1)
  
  // main.png 불투명도 (스크롤하면 어두워짐)
  const mainOpacity = 1 - scrollProgress
  
  // main2.png 위치 (아래에서 위로)
  const main2TranslateY = (1 - scrollProgress) * 100

  // 페이지별 이미지 매핑
  const getPageImage = (page) => {
    const imageMap = {
      'insole': '/es.png',
      'mealtune': '/te.png', 
      'pibit': '/ju.png',
      'murmur': '/jm.png',
      'vaya': '/hj.png',
      'closie': '/sy.png'
    }
    return imageMap[page]
  }

  const getPageTitle = (page) => {
    const titleMap = {
      'insole': 'INSOLE°R',
      'mealtune': 'MealTune',
      'pibit': 'PIBIT', 
      'murmur': 'Murmur',
      'vaya': 'VĀYA',
      'closie': 'Closie'
    }
    return titleMap[page]
  }

  return (
    <>
      {/* 상세 페이지 */}
      {currentPage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10000,
          backgroundColor: 'white'
        }}>
          <img 
            src={getPageImage(currentPage)}
            alt={`${getPageTitle(currentPage)} 페이지`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => setCurrentPage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: isBackButtonHovering ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '70px',
              height: '70px',
              fontSize: '32px',
              fontWeight: 'bold',
              cursor: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              transition: 'background-color 0.2s ease',
              lineHeight: '1',
              paddingLeft: '3px' // 화살표를 중앙에 맞추기 위한 미세 조정
            }}
          >
            ←
          </button>

          {/* 상세 페이지용 노란 원 커서 */}
          <div 
            style={{
              position: 'fixed',
              left: mousePos.x - 40,
              top: mousePos.y - 40,
              width: '80px',
              height: '80px',
              backgroundColor: isBackButtonHovering ? '#FFD700' : '#FFEB3B',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 10002,
              transition: 'background-color 0.1s ease, box-shadow 0.1s ease, transform 0.1s ease',
              transform: isBackButtonHovering ? 'scale(1.3)' : 'scale(1)',
              boxShadow: isBackButtonHovering 
                ? '0 0 30px #FFD700, 0 0 60px #FFD700, 0 0 90px #FFD700' 
                : '0 0 15px rgba(255, 235, 59, 0.5)',
              opacity: 0.9
            }}
          />
        </div>
      )}

      {/* 기존 메인 페이지 */}
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

        {/* 메인 페이지용 노란 원 커서 */}
        {!currentPage && (
          <div 
            style={{
              position: 'fixed',
              left: mousePos.x - 40,
              top: mousePos.y - 40,
              width: '80px',
              height: '80px',
              backgroundColor: isHovering ? '#FFD700' : '#FFEB3B',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 9999,
              transition: 'background-color 0.1s ease, box-shadow 0.1s ease, transform 0.1s ease',
              transform: isHovering ? 'scale(1.3)' : 'scale(1)',
              boxShadow: isHovering 
                ? '0 0 30px #FFD700, 0 0 60px #FFD700, 0 0 90px #FFD700' 
                : '0 0 15px rgba(255, 235, 59, 0.5)',
              opacity: 0.9
            }}
          />
        )}

      </div>

      {/* 전역 커서 숨기기 */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </>
  )
} 