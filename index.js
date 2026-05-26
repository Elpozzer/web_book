document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bookViewport = document.getElementById('book-viewport');
    const book3D = document.getElementById('book-3d');
    const spineTitleText = document.getElementById('spine-title-text');
    const thicknessSlider = document.getElementById('thickness-slider');
    const pageCountDisplay = document.getElementById('page-count-display');
    const btnSpinToggle = document.getElementById('btn-spin-toggle');
    const btnResetView = document.getElementById('btn-reset-view');
    const presetButtons = document.querySelectorAll('.btn-preset');
    
    // Swappers DOM
    const coverSwapButtons = document.querySelectorAll('.btn-cover');
    const bgSwapButtons = document.querySelectorAll('.btn-bg');
    const pageSwapButtons = document.querySelectorAll('.btn-page');

    // Asset Vault HUD DOM
    const vaultCoverThumb = document.getElementById('vault-cover-thumb');
    const vaultCoverName = document.getElementById('vault-cover-name');
    const vaultCoverDl = document.getElementById('vault-cover-dl');

    const vaultBgThumb = document.getElementById('vault-bg-thumb');
    const vaultBgName = document.getElementById('vault-bg-name');
    const vaultBgDl = document.getElementById('vault-bg-dl');

    const vaultPageThumb = document.getElementById('vault-page-thumb');
    const vaultPageName = document.getElementById('vault-page-name');
    const vaultPageDl = document.getElementById('vault-page-dl');

    // State Variables
    let isDragging = false;
    let isAutoSpinning = true;
    let startX, startY;
    
    // Initial rotations (matching 3D Angle preset)
    let rotX = 25;
    let rotY = -35;
    
    // Limits
    const minRotX = -60;
    const maxRotX = 60;

    // Apply auto-spin and default theme on start
    book3D.classList.add('auto-spin');
    book3D.classList.add('theme-dali');

    /* ==========================================================================
       AUTO-SPIN CONTROL
       ========================================================================== */
    function setAutoSpin(active) {
        isAutoSpinning = active;
        if (active) {
            book3D.classList.add('auto-spin');
            btnSpinToggle.classList.add('active');
            book3D.style.transform = '';
        } else {
            book3D.classList.remove('auto-spin');
            btnSpinToggle.classList.remove('active');
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

    // Mouse Down
    bookViewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        bookViewport.style.cursor = 'grabbing';
        
        if (isAutoSpinning) {
            setAutoSpin(false);
        }
        
        book3D.style.transition = 'none';
        startX = e.clientX;
        startY = e.clientY;
    });

    // Mouse Move
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        rotY += deltaX * 0.5;
        rotX -= deltaY * 0.5;
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
        book3D.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
        clearActivePresets();
    });

    /* ==========================================================================
       TOUCH SUPPORT FOR MOBILE DEVICES
       ========================================================================== */
    bookViewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            if (isAutoSpinning) setAutoSpin(false);
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
        book3D.style.setProperty('--book-thickness', `${thickness}px`);
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
            setAutoSpin(false);
            
            book3D.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
            
            switch(preset) {
                case 'front':
                    rotX = 0; rotY = 0; break;
                case 'angle':
                    rotX = 25; rotY = -35; break;
                case 'spine':
                    rotX = 0; rotY = 90; break;
                case 'pages':
                    rotX = 0; rotY = -90; break;
            }
            updateBookTransform();
        });
    });

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

    /* ==========================================================================
       REAL-TIME ASSET CUSTOMIZATION SWAPPERS
       ========================================================================== */

    // 1. Cover Swapper
    coverSwapButtons.forEach(button => {
        button.addEventListener('click', () => {
            const coverFile = button.getAttribute('data-cover');
            
            // Toggle Button class
            coverSwapButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            // Apply CSS Variable
            document.documentElement.style.setProperty('--current-cover', `url('${coverFile}')`);

            // Sync Vault HUD
            vaultCoverThumb.style.backgroundImage = `url('${coverFile}')`;
            vaultCoverName.textContent = coverFile;
            vaultCoverDl.href = coverFile;
            vaultCoverDl.download = coverFile;

            // Apply specialized 3D book theme classes and dynamic spine text
            book3D.classList.remove('theme-dali', 'theme-bella', 'theme-blueprint', 'theme-origami');
            
            if (coverFile === 'cover_dali.png') {
                book3D.classList.add('theme-dali');
                spineTitleText.textContent = 'LA CASA DE PAPEL';
            } else if (coverFile === 'cover_bella.png') {
                book3D.classList.add('theme-bella');
                spineTitleText.textContent = 'BELLA CIAO';
            } else if (coverFile === 'cover_blueprint.png') {
                book3D.classList.add('theme-blueprint');
                spineTitleText.textContent = 'PLAN DE ESCAPE';
            } else if (coverFile === 'cover_origami.png') {
                book3D.classList.add('theme-origami');
                spineTitleText.textContent = 'EL PROFESOR';
            }
        });
    });

    // 2. Background Environment Swapper
    bgSwapButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bgFile = button.getAttribute('data-bg');

            // Toggle Button class
            bgSwapButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            // Apply CSS Variable (triggering transition)
            document.documentElement.style.setProperty('--current-bg', `url('${bgFile}')`);

            // Sync Vault HUD
            vaultBgThumb.style.backgroundImage = `url('${bgFile}')`;
            vaultBgName.textContent = bgFile;
            vaultBgDl.href = bgFile;
            vaultBgDl.download = bgFile;
        });
    });

    // 3. Page Finish Swapper
    pageSwapButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pagesFile = button.getAttribute('data-pages');

            // Toggle Button class
            pageSwapButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            // Apply CSS Variable
            document.documentElement.style.setProperty('--current-pages-texture', `url('${pagesFile}')`);

            // Sync Vault HUD
            vaultPageThumb.style.backgroundImage = `url('${pagesFile}')`;
            vaultPageName.textContent = pagesFile;
            vaultPageDl.href = pagesFile;
            vaultPageDl.download = pagesFile;
        });
    });
});
