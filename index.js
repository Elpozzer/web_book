document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const appWrapper = document.getElementById('app-wrapper');
    const sidebarPanel = document.getElementById('sidebar-panel');
    const bookViewport = document.getElementById('book-viewport');
    const book3D = document.getElementById('book-3d');
    const bookBack = document.getElementById('book-back');
    const bookSpine = document.getElementById('book-spine');
    
    // Fallback text fields
    const spineTitleText = document.getElementById('spine-title-text');
    const backTitleText = document.getElementById('back-title-text');

    // Thickness & Rotation Controls
    const thicknessSlider = document.getElementById('thickness-slider');
    const pageCountDisplay = document.getElementById('page-count-display');
    const btnSpinToggle = document.getElementById('btn-spin-toggle');
    const btnResetView = document.getElementById('btn-reset-view');
    const presetButtons = document.querySelectorAll('.btn-preset');
    
    // Sidebar Collapsible Toggles
    const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');
    const btnExpandSidebar = document.getElementById('btn-expand-sidebar');

    // Swappers DOM (Presets)
    const coverSwapButtons = document.querySelectorAll('.btn-cover');
    const bgSwapButtons = document.querySelectorAll('.btn-bg');

    // Local Custom File Uploaders
    const inputCustomCover = document.getElementById('input-custom-cover');
    const inputCustomBack = document.getElementById('input-custom-back');
    const inputCustomSpine = document.getElementById('input-custom-spine');
    const inputCustomPages = document.getElementById('input-custom-pages');
    const inputCustomBg = document.getElementById('input-custom-bg');
    const resetAssetButtons = document.querySelectorAll('.btn-reset-asset');

    // Spine Customizer Swatches & Text
    const inputSpineTitle = document.getElementById('input-spine-title');
    const inputSpineBgColor = document.getElementById('input-spine-bg-color');
    const inputSpineTextColor = document.getElementById('input-spine-text-color');
    const labelSpineBgColor = document.getElementById('label-spine-bg-color');
    const labelSpineTextColor = document.getElementById('label-spine-text-color');

    // Asset Vault HUD DOM
    const vaultCoverThumb = document.getElementById('vault-cover-thumb');
    const vaultCoverName = document.getElementById('vault-cover-name');
    const vaultCoverDl = document.getElementById('vault-cover-dl');

    const vaultBgThumb = document.getElementById('vault-bg-thumb');
    const vaultBgName = document.getElementById('vault-bg-name');
    const vaultBgDl = document.getElementById('vault-bg-dl');

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
       SIDEBAR COLLAPSIBILITY (CINEMATIC FOCUS MODE)
       ========================================================================== */
    function collapseSidebar() {
        sidebarPanel.classList.add('collapsed');
        btnExpandSidebar.classList.add('visible');
    }

    function expandSidebar() {
        sidebarPanel.classList.remove('collapsed');
        btnExpandSidebar.classList.remove('visible');
    }

    btnCollapseSidebar.addEventListener('click', collapseSidebar);
    btnExpandSidebar.addEventListener('click', expandSidebar);

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
        // If clicking collapse triggers, ignore
        if (e.target.closest('.collapse-toggle-btn') || e.target.closest('.floating-trigger-btn')) return;
        
        isDragging = true;
        bookViewport.style.cursor = 'grabbing';
        
        if (isAutoSpinning) setAutoSpin(false);
        
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
        if (e.target.closest('.collapse-toggle-btn') || e.target.closest('.floating-trigger-btn')) return;
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
                case 'front': rotX = 0; rotY = 0; break;
                case 'angle': rotX = 25; rotY = -35; break;
                case 'spine': rotX = 0; rotY = 90; break;
                case 'pages': rotX = 0; rotY = -90; break;
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
       UNIVERSAL LOCAL FILE UPLOADERS (FileReader)
       ========================================================================== */
    
    // Front Cover Uploader
    inputCustomCover.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            
            // Set CSS cover variable
            document.documentElement.style.setProperty('--current-cover', `url('${dataUrl}')`);
            
            // Toggle label styling
            inputCustomCover.parentElement.classList.add('has-file');

            // Sync Vault HUD
            vaultCoverThumb.style.backgroundImage = `url('${dataUrl}')`;
            vaultCoverName.textContent = file.name;
            vaultCoverDl.href = dataUrl;
            vaultCoverDl.download = file.name;

            // Remove active presets button styling
            coverSwapButtons.forEach(btn => btn.classList.remove('active'));
        };
        reader.readAsDataURL(file);
    });

    // Back Cover Uploader
    inputCustomBack.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            
            // Inject custom back cover image and toggle display helper class
            document.documentElement.style.setProperty('--current-back', `url('${dataUrl}')`);
            bookBack.classList.add('has-custom-back');
            inputCustomBack.parentElement.classList.add('has-file');
        };
        reader.readAsDataURL(file);
    });

    // Spine Uploader
    inputCustomSpine.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            
            // Inject custom spine image and toggle display helper class
            document.documentElement.style.setProperty('--current-spine', `url('${dataUrl}')`);
            bookSpine.classList.add('has-custom-spine');
            inputCustomSpine.parentElement.classList.add('has-file');
        };
        reader.readAsDataURL(file);
    });

    // Page Edge Texture Uploader
    inputCustomPages.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            
            // Set pages edge custom texture variable
            document.documentElement.style.setProperty('--current-pages-texture', `url('${dataUrl}')`);
            inputCustomPages.parentElement.classList.add('has-file');
        };
        reader.readAsDataURL(file);
    });

    // Environment Backdrop Uploader
    inputCustomBg.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            
            // Set dynamic background backdrop variable
            document.documentElement.style.setProperty('--current-bg', `url('${dataUrl}')`);
            inputCustomBg.parentElement.classList.add('has-file');

            // Sync Vault HUD
            vaultBgThumb.style.backgroundImage = `url('${dataUrl}')`;
            vaultBgName.textContent = file.name;
            vaultBgDl.href = dataUrl;
            vaultBgDl.download = file.name;

            bgSwapButtons.forEach(btn => btn.classList.remove('active'));
        };
        reader.readAsDataURL(file);
    });

    /* ==========================================================================
       RESET CUSTOM ASSET BACK TO PRESETS
       ========================================================================== */
    resetAssetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-reset');

            if (target === 'cover') {
                // Restore active heist cover preset
                const activeCoverBtn = Array.from(coverSwapButtons).find(btn => btn.classList.contains('active'));
                const defaultCover = activeCoverBtn ? activeCoverBtn.getAttribute('data-cover') : 'cover_dali.png';
                document.documentElement.style.setProperty('--current-cover', `url('${defaultCover}')`);
                inputCustomCover.parentElement.classList.remove('has-file');
                inputCustomCover.value = '';
                
                // Sync Vault HUD back
                vaultCoverThumb.style.backgroundImage = `url('${defaultCover}')`;
                vaultCoverName.textContent = defaultCover;
                vaultCoverDl.href = defaultCover;
                vaultCoverDl.download = defaultCover;
            } 
            else if (target === 'back') {
                bookBack.classList.remove('has-custom-back');
                document.documentElement.style.setProperty('--current-back', 'none');
                inputCustomBack.parentElement.classList.remove('has-file');
                inputCustomBack.value = '';
            } 
            else if (target === 'spine') {
                bookSpine.classList.remove('has-custom-spine');
                document.documentElement.style.setProperty('--current-spine', 'none');
                inputCustomSpine.parentElement.classList.remove('has-file');
                inputCustomSpine.value = '';
            } 
            else if (target === 'pages') {
                document.documentElement.style.setProperty('--current-pages-texture', "url('pages_standard.png')");
                inputCustomPages.parentElement.classList.remove('has-file');
                inputCustomPages.value = '';
            } 
            else if (target === 'bg') {
                const activeBgBtn = Array.from(bgSwapButtons).find(btn => btn.classList.contains('active'));
                const defaultBg = activeBgBtn ? activeBgBtn.getAttribute('data-bg') : 'bg_hideout.png';
                document.documentElement.style.setProperty('--current-bg', `url('${defaultBg}')`);
                inputCustomBg.parentElement.classList.remove('has-file');
                inputCustomBg.value = '';

                vaultBgThumb.style.backgroundImage = `url('${defaultBg}')`;
                vaultBgName.textContent = defaultBg;
                vaultBgDl.href = defaultBg;
                vaultBgDl.download = defaultBg;
            }
        });
    });

    /* ==========================================================================
       DYNAMIC SPINE TEXT & COLOR DESIGNER
       ========================================================================== */
    
    // Spine Title Text Sync
    inputSpineTitle.addEventListener('input', (e) => {
        const text = e.target.value;
        
        // Dynamic title update
        spineTitleText.textContent = text ? text.toUpperCase() : 'MOCKUP BOOK';
        
        // Sync with Back cover title text
        backTitleText.textContent = text ? text.toUpperCase() : 'MOCKUP BOOK';
    });

    // Spine Background Color Picker
    inputSpineBgColor.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--spine-bg-color', color);
        labelSpineBgColor.textContent = color.toUpperCase();
    });

    // Spine Text Color Picker
    inputSpineTextColor.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--spine-text-color', color);
        labelSpineTextColor.textContent = color.toUpperCase();
    });

    /* ==========================================================================
       HEIST PRESETS BUTTONS SWAPPERS (MAPPED TO EXTENDED ASSETS)
       ========================================================================== */
    coverSwapButtons.forEach(button => {
        button.addEventListener('click', () => {
            const coverFile = button.getAttribute('data-cover');
            
            coverSwapButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            // Set current cover
            document.documentElement.style.setProperty('--current-cover', `url('${coverFile}')`);

            // Clear custom file input if active
            inputCustomCover.parentElement.classList.remove('has-file');
            inputCustomCover.value = '';

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
                backTitleText.textContent = 'EL PROFESOR';
                inputSpineTitle.value = 'LA CASA DE PAPEL';
            } else if (coverFile === 'cover_bella.png') {
                book3D.classList.add('theme-bella');
                spineTitleText.textContent = 'BELLA CIAO';
                backTitleText.textContent = 'RESISTANCE';
                inputSpineTitle.value = 'BELLA CIAO';
            } else if (coverFile === 'cover_blueprint.png') {
                book3D.classList.add('theme-blueprint');
                spineTitleText.textContent = 'PLAN DE ESCAPE';
                backTitleText.textContent = 'BLUEPRINT';
                inputSpineTitle.value = 'PLAN DE ESCAPE';
            } else if (coverFile === 'cover_origami.png') {
                book3D.classList.add('theme-origami');
                spineTitleText.textContent = 'EL PROFESOR';
                backTitleText.textContent = 'ORIGAMI';
                inputSpineTitle.value = 'EL PROFESOR';
            }
        });
    });

    bgSwapButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bgFile = button.getAttribute('data-bg');

            bgSwapButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            // Apply background environment
            document.documentElement.style.setProperty('--current-bg', `url('${bgFile}')`);

            // Clear custom file input if active
            inputCustomBg.parentElement.classList.remove('has-file');
            inputCustomBg.value = '';

            // Sync Vault HUD
            vaultBgThumb.style.backgroundImage = `url('${bgFile}')`;
            vaultBgName.textContent = bgFile;
            vaultBgDl.href = bgFile;
            vaultBgDl.download = bgFile;
        });
    });
});
