import { useState, useEffect } from 'react'
import Image from 'next/image'

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
  const [windowHeight, setWindowHeight] = useState(1000) // 창 높이 상태
  const [showDebug, setShowDebug] = useState(false) // 디버깅 정보 표시 여부
  const [backgroundLoading, setBackgroundLoading] = useState(true) // 백그라운드 로딩 상태
  const [loadingProgress, setLoadingProgress] = useState(0) // 로딩 진행률

  // 스크롤 진행도 계산 (0~1) - 메인 페이지용 (반응형으로 개선)
  const maxScroll = Math.max(600, windowHeight * 1.0) // 최소 600px, 또는 화면 높이만큼
  const scrollProgress = Math.min(scrollY / maxScroll, 1)
  
  // 상세 페이지 스크롤 계산 - 더 안정적인 계산
  const detailMaxScroll = Math.max(800, windowHeight * 1.2) // 최소 800px, 또는 화면 높이의 1.2배
  const detailScrollProgress = Math.min(detailScrollY / detailMaxScroll, 1)
  const detailFirstImageOpacity = Math.max(0, 1 - detailScrollProgress * 1.5) // 더 빨리 사라지도록
  const detailSecondImageTranslateY = Math.max(0, (1 - detailScrollProgress * 1.2) * 100) // 더 빨리 올라오도록

  // main.png 불투명도 (스크롤하면 어두워짐)
  const mainOpacity = 1 - scrollProgress
  
  // main2.png 위치 (아래에서 위로)
  const main2TranslateY = (1 - scrollProgress) * 100

  // 창 크기 변화 감지
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }
    
    const handleKeyDown = (e) => {
      // Ctrl + D로 디버깅 정보 토글
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        setShowDebug(prev => !prev)
      }
    }
    
    // 초기 설정
    if (typeof window !== 'undefined') {
      setWindowHeight(window.innerHeight)
      window.addEventListener('resize', handleResize)
      window.addEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [])

  // 메인 페이지에서 백그라운드 이미지 프리로딩
  useEffect(() => {
    if (!currentPage) { // 메인 페이지에서만
      const imagesToPreload = [
        '/es.png', '/es2.png',
        '/te.png', '/te2.png', 
        '/ju.png', '/ju2.png',
        '/jm.png', '/jm2.png',
        '/hj.png', '/hj2.png',
        '/sy.png', '/sy2.png'
      ]

      let loadedCount = 0
      const totalImages = imagesToPreload.length

      setBackgroundLoading(true)
      setLoadingProgress(0)

      imagesToPreload.forEach((imageSrc, index) => {
        // 우선순위가 높은 첫 번째 이미지들을 먼저 로딩
        const delay = imageSrc.includes('2.png') ? 2000 : 0 // 두 번째 이미지들은 2초 후에 로딩

        setTimeout(() => {
          const img = new window.Image()
          img.onload = () => {
            loadedCount++
            setLoadingProgress((loadedCount / totalImages) * 100)
            setLoadedImages(prev => new Set([...prev, imageSrc]))
            
            if (loadedCount === totalImages) {
              setBackgroundLoading(false)
            }
          }
          img.onerror = () => {
            loadedCount++
            setLoadingProgress((loadedCount / totalImages) * 100)
            
            if (loadedCount === totalImages) {
              setBackgroundLoading(false)
            }
          }
          img.src = imageSrc
        }, delay)
      })
    }
  }, [currentPage])

  // 이미지 프리로딩 (페이지별로 필요할 때만)
  useEffect(() => {
    if (currentPage && ['mealtune', 'murmur', 'insole', 'pibit', 'closie', 'vaya'].includes(currentPage)) {
      const secondImage = getSecondPageImage(currentPage)
      if (secondImage && !loadedImages.has(secondImage)) {
        setIsLoading(true)
        const img = new window.Image() // window.Image로 명시적 접근
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, secondImage]))
          setIsLoading(false)
        }
        img.onerror = () => {
          setIsLoading(false)
        }
        img.src = secondImage
      } else if (secondImage && loadedImages.has(secondImage)) {
        setIsLoading(false) // 이미 로드된 경우 즉시 로딩 완료
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

  // 페이지 전환 시 스크롤 위치 초기화 및 로딩 상태 설정
  useEffect(() => {
    if (currentPage) {
      window.scrollTo(0, 0)
      setDetailScrollY(0)
      
      // 페이지 전환 시 잠깐 로딩 표시 (UX 개선)
      setIsLoading(true)
      setTimeout(() => {
        if (loadedImages.has(getSecondPageImage(currentPage))) {
          setIsLoading(false)
        }
      }, 300)
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
        // 뒤로가기 버튼 영역 (왼쪽 상단 80x80 영역)
        const backButtonHover = e.clientX >= 30 && e.clientX <= 110 && 
                               e.clientY >= 30 && e.clientY <= 110
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
      let hoveredProject = null
      
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
          // 프로젝트 매핑
          const projects = ['insole', 'mealtune', 'pibit', 'murmur', 'vaya', 'closie']
          hoveredProject = projects[i]
          break // 하나라도 호버되면 break
        }
      }
      
      // 호버된 프로젝트의 이미지 즉시 프리로딩
      if (hoveredProject && ['mealtune', 'murmur', 'insole', 'pibit', 'closie', 'vaya'].includes(hoveredProject)) {
        const firstImage = getPageImage(hoveredProject)
        const secondImage = getSecondPageImage(hoveredProject)
        
        // 첫 번째 이미지 프리로딩
        if (firstImage && !loadedImages.has(firstImage)) {
          const img1 = new window.Image()
          img1.onload = () => {
            setLoadedImages(prev => new Set([...prev, firstImage]))
          }
          img1.src = firstImage
        }
        
        // 두 번째 이미지 프리로딩 (우선순위 낮음)
        if (secondImage && !loadedImages.has(secondImage)) {
          setTimeout(() => {
            const img2 = new window.Image()
            img2.onload = () => {
              setLoadedImages(prev => new Set([...prev, secondImage]))
            }
            img2.src = secondImage
          }, 500) // 500ms 후 로딩
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
  }, [scrollY, currentPage, maxScroll, loadedImages])

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

  return (
    <>
      {/* 디버깅 정보 (Ctrl+D로 토글 가능) */}
      {showDebug && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 10030,
          fontFamily: 'monospace',
          border: '1px solid #333'
        }}>
          <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#FFD700' }}>
            디버그 정보 (Ctrl+D로 숨기기) - {currentPage || '메인'}
          </div>
          
          {!currentPage ? (
            // 메인 페이지 디버깅 정보
            <>
              <div>화면 높이: {windowHeight}px</div>
              <div>메인 스크롤: {scrollY}px</div>
              <div>메인 최대 스크롤: {maxScroll.toFixed(0)}px</div>
              <div>메인 진행도: {(scrollProgress * 100).toFixed(1)}%</div>
              <div>main.png 불투명도: {mainOpacity.toFixed(2)}</div>
              <div>main2.png Y위치: {main2TranslateY.toFixed(1)}vh</div>
            </>
          ) : (
            // 상세 페이지 디버깅 정보
            ['mealtune', 'murmur', 'insole', 'pibit', 'closie', 'vaya'].includes(currentPage) && (
              <>
                <div>화면 높이: {windowHeight}px</div>
                <div>스크롤: {detailScrollY}px</div>
                <div>최대 스크롤: {detailMaxScroll.toFixed(0)}px</div>
                <div>진행도: {(detailScrollProgress * 100).toFixed(1)}%</div>
                <div>첫번째 불투명도: {detailFirstImageOpacity.toFixed(2)}</div>
                <div>두번째 Y위치: {detailSecondImageTranslateY.toFixed(1)}vh</div>
                <div>스크롤 활성화: {detailScrollProgress >= 0.5 ? 'YES' : 'NO'}</div>
                <div>컨테이너 높이: {Math.max(windowHeight * 4, 2000)}px</div>
              </>
            )
          )}
        </div>
      )}

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
              <div style={{ height: `${Math.max(windowHeight * 4, 2000)}px`, position: 'relative' }}>
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
                  <Image 
                    src={getPageImage(currentPage)}
                    alt={`${getPageTitle(currentPage)} 페이지`}
                    fill
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    priority={true}
                    quality={90}
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
                    overflow: detailScrollProgress >= 0.5 ? 'scroll' : 'hidden', // 50%에서 스크롤 가능
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE/Edge
                    scrollBehavior: 'smooth'
                  }}>
                    {/* 긴 스크롤 이미지는 기존 img 태그 유지 (디자인 보존) */}
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
            <Image 
              src={getPageImage(currentPage)}
              alt={`${getPageTitle(currentPage)} 페이지`}
              fill
              style={{
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              priority={true}
              quality={90}
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
              opacity: isBackButtonHovering ? 0.8 : 1,
              filter: isBackButtonHovering ? 'brightness(1.2)' : 'brightness(1)'
            }}
          >
            <Image 
              src="/back.png"
              alt="뒤로가기"
              fill
              style={{
                objectFit: 'contain'
              }}
              quality={100}
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
      <div style={{ height: `${Math.max(windowHeight * 2.5, 1500)}px`, position: 'relative' }}>
        
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
          <Image 
            src="/main.png" 
            alt="메인 이미지"
            fill
            style={{
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            priority={true}
            quality={90}
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
          <Image 
            src="/main2.png" 
            alt="두 번째 이미지"
            fill
            style={{
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            priority={true}
            quality={90}
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

      {/* 메인 페이지 백그라운드 로딩 인디케이터 */}
      {!currentPage && backgroundLoading && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '10px',
          padding: '15px 20px',
          color: 'white',
          fontSize: '14px',
          zIndex: 10025,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #333',
            borderTop: '2px solid #FFD700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>
            <div>이미지 로딩 중...</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>
              {Math.round(loadingProgress)}% 완료
            </div>
          </div>
        </div>
      )}

      {/* 페이지별 로딩 인디케이터 (더 크고 잘 보이게) */}
      {currentPage && isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 10050,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #FFD700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <div style={{
            fontSize: '18px',
            color: '#333',
            fontWeight: 'bold'
          }}>
            {getPageTitle(currentPage)} 로딩 중...
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginTop: '10px'
          }}>
            잠시만 기다려주세요
          </div>
        </div>
      )}

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