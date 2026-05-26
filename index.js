document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bookViewport = document.getElementById('book-viewport');
    const book3D = document.getElementById('book-3d');
    const thicknessSlider = document.getElementById('thickness-slider');
    const pageCountDisplay = document.getElementById('page-count-display');
    const btnSpinToggle = document.getElementById('btn-spin-toggle');
    const btnResetView = document.getElementById('btn-reset-view');
    const presetButtons = document.querySelectorAll('.btn-preset');

    // State Variables
    let isDragging = false;
    let isAutoSpinning = true;
    let startX, startY;
    
    // Initial rotations (matching the 3D Angle CSS default)
    let rotX = 25;
    let rotY = -35;
    
    // Limits
    const minRotX = -60;
    const maxRotX = 60;

    // Apply auto-spin on start
    book3D.classList.add('auto-spin');

    /* ==========================================================================
       AUTO-SPIN CONTROL
       ========================================================================== */
    function setAutoSpin(active) {
        isAutoSpinning = active;
        if (active) {
            book3D.classList.add('auto-spin');
            btnSpinToggle.classList.add('active');
            // Remove style transform so the keyframe animation takes full control
            book3D.style.transform = '';
        } else {
            book3D.classList.remove('auto-spin');
            btnSpinToggle.classList.remove('active');
            // Sync values from current CSS transform matrix or fallback to last known
            updateBookTransform();
        }
    }

    btnSpinToggle.addEventListener('click', () => {
        setAutoSpin(!isAutoSpinning);
    });

    /* ==========================================================================
       MANUAL 3D DRAGGING & ROTATION
       ========================================================================== */
    function updateBookTransform() {
        book3D.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    // Capture the current angle of rotation in case we are stopping mid-animation
    function captureCurrentRotation() {
        const computedStyle = window.getComputedStyle(book3D);
        const matrix = computedStyle.transform;
        
        if (matrix && matrix !== 'none') {
            // Basic matrix decomposition to get angles (approximate)
            const values = matrix.split('(')[1].split(')')[0].split(',');
            // If it is a 3D matrix (has 16 elements)
            if (values.length === 16) {
                // For simplicity, we preserve our last dragged angles if available,
                // or fall back to standard coordinates. Capture allows continuous drag from release.
            }
        }
    }

    // Mouse Down
    bookViewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        bookViewport.style.cursor = 'grabbing';
        
        if (isAutoSpinning) {
            captureCurrentRotation();
            setAutoSpin(false);
        }
        
        // Remove animation transition during drag for real-time response
        book3D.style.transition = 'none';
        
        startX = e.clientX;
        startY = e.clientY;
    });

    // Mouse Move
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // Scale factors to make rotation feel smooth and matching hand movement
        rotY += deltaX * 0.5;
        rotX -= deltaY * 0.5;

        // Apply bounds to vertical axis so we don't flip upside down
        rotX = Math.max(minRotX, Math.min(maxRotX, rotX));

        updateBookTransform();

        startX = e.clientX;
        startY = e.clientY;
    });

    // Mouse Up / End Drag
    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        bookViewport.style.cursor = 'grab';
        
        // Re-enable smooth transition for other programmatic movements
        book3D.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
        
        // Sync preset buttons (none of them matches exactly anymore)
        clearActivePresets();
    });

    /* ==========================================================================
       TOUCH SUPPORT FOR MOBILE DEVICES
       ========================================================================== */
    bookViewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            
            if (isAutoSpinning) {
                setAutoSpin(false);
            }
            
            book3D.style.transition = 'none';
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;

        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;

        rotY += deltaX * 0.6;
        rotX -= deltaY * 0.6;
        rotX = Math.max(minRotX, Math.min(maxRotX, rotX));

        updateBookTransform();

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        book3D.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
        clearActivePresets();
    });

    /* ==========================================================================
       DYNAMIC THICKNESS (PAGE DENSITY)
       ========================================================================== */
    thicknessSlider.addEventListener('input', (e) => {
        const thickness = e.target.value;
        
        // Update CSS variable
        book3D.style.setProperty('--book-thickness', `${thickness}px`);
        
        // Update human readable page count (e.g. 50px thickness = 500 pages)
        const pageCount = thickness * 10;
        pageCountDisplay.textContent = `${pageCount} Pages`;
    });

    /* ==========================================================================
       CAMERA VIEW PRESETS
       ========================================================================== */
    function clearActivePresets() {
        presetButtons.forEach(btn => btn.classList.remove('active'));
    }

    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const preset = button.getAttribute('data-preset');
            
            clearActivePresets();
            button.classList.add('active');
            
            // Stop auto spinning to look at a static preset
            setAutoSpin(false);
            
            // Apply standard CSS transitions for smooth camera fly-to
            book3D.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
            
            switch(preset) {
                case 'front':
                    rotX = 0;
                    rotY = 0;
                    break;
                case 'angle':
                    rotX = 25;
                    rotY = -35;
                    break;
                case 'spine':
                    rotX = 0;
                    rotY = 90;
                    break;
                case 'pages':
                    rotX = 0;
                    rotY = -90;
                    break;
            }
            
            updateBookTransform();
        });
    });

    // Reset View Button
    btnResetView.addEventListener('click', () => {
        clearActivePresets();
        const anglePresetBtn = Array.from(presetButtons).find(btn => btn.getAttribute('data-preset') === 'angle');
        if (anglePresetBtn) anglePresetBtn.classList.add('active');
        
        setAutoSpin(false);
        book3D.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
        
        rotX = 25;
        rotY = -35;
        updateBookTransform();
    });
});
