document.addEventListener('DOMContentLoaded', () => {

  const animationSetup = () => {
    const isMouseTrack = true;
    const isParallax = false;

    if (!isMouseTrack && !isParallax) return;
    if (window.innerWidth <= 992) return;

    document.querySelectorAll('.mouse-track-container').forEach(container => {
        const images = container.querySelectorAll('img');
        images.forEach((img, index) => {
            if (img.classList.contains('rellax') || img.classList.contains('mouse-track-element') || img.classList.contains('interactive-element')) {
                return;
            }

            if (isMouseTrack && isParallax) {
                img.classList.add('interactive-element');
                img.dataset.speed = (index % 2 === 0) ? (25 + index * 5) : -(30 + index * 5);
                img.dataset.parallaxSpeed = (index % 2 === 0) ? -1.5 : 1;
            } else if (isMouseTrack) {
                img.classList.add('mouse-track-element');
                img.dataset.speed = (index % 2 === 0) ? (20 + index * 5) : -(25 + index * 5);
            } else if (isParallax) {
                img.classList.add('rellax');
                img.dataset.rellaxSpeed = (index % 2 === 0) ? -2 : 1;
            }
        });
    });
  };
  animationSetup();
  


  const header = document.querySelector('.main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }


  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 50,
    });
  }


  const mouseTrackContainers = document.querySelectorAll('.mouse-track-container');
  if (mouseTrackContainers.length > 0 && window.innerWidth > 992) {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              const container = entry.target;

              if (!container.animationInitialized) {
                  const elementsToMove = container.querySelectorAll('.mouse-track-element');
                  if (elementsToMove.length === 0) return;

                  container.animationState = {
                      elements: elementsToMove,
                      mouseX: 0, mouseY: 0,
                      targetMouseX: 0, targetMouseY: 0,
                      animationFrameId: null,
                  };

                  container.handleMouseMove = (e) => {
                      const rect = container.getBoundingClientRect();
                      container.animationState.targetMouseX = e.clientX - (rect.left + rect.width / 2);
                      container.animationState.targetMouseY = e.clientY - (rect.top + rect.height / 2);
                  };

                  container.handleMouseLeave = () => {
                      container.animationState.targetMouseX = 0;
                      container.animationState.targetMouseY = 0;
                  };

                  container.updatePositions = () => {
                      const state = container.animationState;
                      const LERP_FACTOR = 0.50;
                      state.mouseX += (state.targetMouseX - state.mouseX) * LERP_FACTOR;
                      state.mouseY += (state.targetMouseY - state.mouseY) * LERP_FACTOR;

                      state.elements.forEach(el => {
                          const speed = parseFloat(el.dataset.speed || 40);
                          const potentialX = state.mouseX / speed;
                          const potentialY = state.mouseY / speed;

                          const horizontalMoveRange = Math.max(0, (container.offsetWidth - el.offsetWidth) / 2);
                          const verticalMoveRange = Math.max(0, (container.offsetHeight - el.offsetHeight) / 2);

                          const finalX = Math.max(-horizontalMoveRange, Math.min(horizontalMoveRange, potentialX));
                          const finalY = Math.max(-verticalMoveRange, Math.min(verticalMoveRange, potentialY));

                          el.style.transform = `translateX(${finalX}px) translateY(${finalY}px)`;
                      });
                      state.animationFrameId = requestAnimationFrame(container.updatePositions);
                  };
                  container.animationInitialized = true;
              }
              
              if (entry.isIntersecting) {
                  container.addEventListener('mousemove', container.handleMouseMove);
                  container.addEventListener('mouseleave', container.handleMouseLeave);
                  if (container.animationState && !container.animationState.animationFrameId) {
                     container.animationState.animationFrameId = requestAnimationFrame(container.updatePositions);
                  }
              } else {
                  if (container.animationState && container.animationState.animationFrameId) {
                      cancelAnimationFrame(container.animationState.animationFrameId);
                      container.animationState.animationFrameId = null;
                  }
                  if(container.handleMouseMove) container.removeEventListener('mousemove', container.handleMouseMove);
                  if(container.handleMouseLeave) container.removeEventListener('mouseleave', container.handleMouseLeave);
              }
          });
      }, { threshold: 0.01 });

      mouseTrackContainers.forEach(container => observer.observe(container));
  }
});