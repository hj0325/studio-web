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
  const [detailScrollY, setDetailScrollY] = useState(0) // 상세 페이지 스크롤 상태
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [currentPage, setCurrentPage] = useState(null) // null=메인, 'insole', 'mealtune', 'pibit', 'murmur', 'vaya', 'closie'
  const [isBackButtonHovering, setIsBackButtonHovering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadedImages, setLoadedImages] = useState(new Set())

  // 이미지 프리로딩 (페이지별로 필요할 때만)
  useEffect(() => {
    if (currentPage && ['mealtune', 'murmur', 'insole', 'pibit', 'closie', 'vaya'].includes(currentPage)) {
      const secondImage = getSecondPageImage(currentPage)
      if (secondImage && !loadedImages.has(secondImage)) {
        setIsLoading(true)
        const img = new Image()
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, secondImage]))
          setIsLoading(false)
        }
        img.onerror = () => {
          setIsLoading(false)
        }
        img.src = secondImage
      }
    }
  }, [currentPage, loadedImages])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (currentPage) {
            setDetailScrollY(window.scrollY)
          } else {
            setScrollY(window.scrollY)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage])

  // 페이지 전환 시 스크롤 위치 초기화
  useEffect(() => {
    if (currentPage) {
      window.scrollTo(0, 0)
      setDetailScrollY(0)
    }
  }, [currentPage])

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

  // MealTune 페이지의 두 번째 이미지 매핑
  const getSecondPageImage = (page) => {
    if (page === 'mealtune') {
      return '/te2.png'
    }
    if (page === 'murmur') {
      return '/jm2.png'
    }
    if (page === 'insole') {
      return '/es2.png'
    }
    if (page === 'pibit') {
      return '/ju2.png'
    }
    if (page === 'closie') {
      return '/sy2.png'
    }
    if (page === 'vaya') {
      return '/hj2.png'
    }
    return null
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

  // 상세 페이지 스크롤 계산 (MealTune 페이지용)
  const detailMaxScroll = 1000 // 1000px 스크롤하면 te2.png로 전환 완료
  const detailScrollProgress = Math.min(detailScrollY / detailMaxScroll, 1)
  const detailFirstImageOpacity = 1 - detailScrollProgress
  const detailSecondImageTranslateY = (1 - detailScrollProgress) * 100

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
                      {/* 스크롤 효과가 적용되는 페이지들 */}
          {(currentPage === 'mealtune' || currentPage === 'murmur' || currentPage === 'insole' || currentPage === 'pibit' || currentPage === 'closie' || currentPage === 'vaya') && (
            <>
              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10020,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '10px',
                  padding: '20px',
                  color: 'white',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #FFD700',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  이미지 로딩 중...
                </div>
              )}

              <div style={{ height: '400vh', position: 'relative' }}>
                {/* 첫 번째 이미지 - 스크롤하면 불투명해짐 */}
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  zIndex: 10001,
                  opacity: detailFirstImageOpacity,
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)'
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
                </div>

                {/* 두 번째 이미지 - 스크롤에 따라 올라오고 크기 조절 */}
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  zIndex: 10002,
                  transform: `translateY(${detailSecondImageTranslateY}vh)`,
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: '85%',
                    height: '100vh',
                    overflow: detailScrollProgress >= 0.7 ? 'scroll' : 'hidden',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE/Edge
                    scrollBehavior: 'smooth'
                  }}>
                    <img 
                      src={getSecondPageImage(currentPage)}
                      alt={`${getPageTitle(currentPage)} 두 번째 페이지`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        maxWidth: '100%',
                        outline: 'none',
                        border: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 다른 페이지들은 기존 방식 유지 */}
          {currentPage !== 'mealtune' && currentPage !== 'murmur' && currentPage !== 'insole' && currentPage !== 'pibit' && currentPage !== 'closie' && currentPage !== 'vaya' && (
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
          )}

          {/* 뒤로가기 버튼 */}
          <div
            onClick={() => setCurrentPage(null)}
            style={{
              position: 'fixed',
              top: '30px',
              left: '30px',
              width: '80px',
              height: '80px',
              cursor: 'none',
              zIndex: 10010,
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              transform: isBackButtonHovering ? 'scale(1.2)' : 'scale(1)',
              opacity: isBackButtonHovering ? 0.8 : 1
            }}
          >
            <img 
              src="/back.png"
              alt="뒤로가기"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: isBackButtonHovering ? 'brightness(1.2)' : 'brightness(1)',
                transition: 'filter 0.2s ease'
              }}
            />
          </div>

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
              zIndex: 10011,
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
          opacity: mainOpacity,
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
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
          transform: `translateY(${main2TranslateY}vh)`,
          backfaceVisibility: 'hidden'
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

      {/* 전역 커서 숨기기 및 스크롤바 숨기기 */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
        
        /* 모든 스크롤바 완전히 숨기기 */
        ::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        ::-webkit-scrollbar-track {
          display: none !important;
        }
        
        ::-webkit-scrollbar-thumb {
          display: none !important;
        }
        
        ::-webkit-scrollbar-corner {
          display: none !important;
        }
        
        /* Firefox 스크롤바 숨기기 */
        * {
          scrollbar-width: none !important;
          scrollbar-color: transparent transparent !important;
        }
        
        /* IE/Edge 스크롤바 숨기기 */
        * {
          -ms-overflow-style: none !important;
        }
        
        /* 로딩 애니메이션 */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
} 