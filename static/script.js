document.addEventListener('DOMContentLoaded', () => {
    // Header, Footer, and Section Loading Functions
    function loadHeader() {
        fetch('/templates/header.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('header').innerHTML = html;
                // After loading header, setup theme toggle
                setupThemeToggle();
            })
            .catch(error => console.error('Error loading header:', error));
    }

    function loadFooter() {
        fetch('/templates/footer.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('footer').innerHTML = html;
            })
            .catch(error => console.error('Error loading footer:', error));
    }

    function loadSection(sectionId) {
        fetch(`/templates/${sectionId}.html`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(html => {
                const main = document.getElementById('main');
                if (main) {
                    // Add fade out animation before replacing content
                    const currentContainer = main.querySelector('.container.active');
                    if (currentContainer) {
                        currentContainer.classList.add('fade-out');
                        // Wait for animation to complete before replacing content
                        setTimeout(() => {
                            main.innerHTML = html;
                            document.querySelectorAll('.container').forEach(container => container.classList.remove('active'));
                            const section = document.getElementById(sectionId);
                            if (section) {
                                // Add fade in animation to new content
                                section.classList.add('active', 'fade-in');
                                // Remove animation class after it completes
                                setTimeout(() => section.classList.remove('fade-in'), 500);
                            } else {
                                console.error(`Section ${sectionId} not found in loaded HTML`);
                            }
                        }, 300);
                    } else {
                        main.innerHTML = html;
                        document.querySelectorAll('.container').forEach(container => container.classList.remove('active'));
                        const section = document.getElementById(sectionId);
                        if (section) {
                            section.classList.add('active', 'fade-in');
                            setTimeout(() => section.classList.remove('fade-in'), 500);
                        } else {
                            console.error(`Section ${sectionId} not found in loaded HTML`);
                        }
                    }
                } else {
                    console.error('Main element not found');
                }
            })
            .catch(error => console.error(`Error loading ${sectionId} section:`, error));
    }

    // Theme toggle functionality - fixed and improved
    function setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) {
            console.error('Theme toggle not found, trying again in 500ms');
            setTimeout(setupThemeToggle, 500);
            return;
        }
        
        const body = document.body;
        const savedTheme = localStorage.getItem('theme') || 
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        body.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        console.log(`Theme set to: ${savedTheme}`);
        
        themeToggle.addEventListener('click', () => {
            console.log('Theme toggle clicked');
            const isDark = body.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            
            // Add a transition class to the body
            body.classList.add('theme-transitioning');
            
            // Update theme
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Animate the icon
            themeToggle.classList.add('theme-toggle-rotating');
            
            // Update icon after rotation
            setTimeout(() => {
                themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
                themeToggle.classList.remove('theme-toggle-rotating');
                body.classList.remove('theme-transitioning');
            }, 300);
            
            console.log(`Switched to ${newTheme} mode`);
        });
    }

    // Initial Load
    loadHeader();
    loadFooter();
    loadSection('predictor');

    // Create enhanced DNA loader HTML
    function createDnaLoaderHtml() {
        return `
        <div class="dna-loader">
            <div class="dna-strand">
                <div class="backbone"></div>
                <div class="nucleotide" style="left: 20px; animation-delay: 0s;"></div>
                <div class="nucleotide-pair" style="left: 20px; animation-delay: 0s;"></div>
                <div class="nucleotide" style="left: 50px; animation-delay: 0.2s;"></div>
                <div class="nucleotide-pair" style="left: 50px; animation-delay: 0.2s;"></div>
                <div class="nucleotide" style="left: 80px; animation-delay: 0.4s;"></div>
                <div class="nucleotide-pair" style="left: 80px; animation-delay: 0.4s;"></div>
                <div class="nucleotide" style="left: 110px; animation-delay: 0.6s;"></div>
                <div class="nucleotide-pair" style="left: 110px; animation-delay: 0.6s;"></div>
                <div class="nucleotide" style="left: 140px; animation-delay: 0.8s;"></div>
                <div class="nucleotide-pair" style="left: 140px; animation-delay: 0.8s;"></div>
                <div class="nucleotide" style="left: 170px; animation-delay: 1s;"></div>
                <div class="nucleotide-pair" style="left: 170px; animation-delay: 1s;"></div>
            </div>
        </div>`;
    }

    // Create enhanced status indicator HTML
    function createStatusIndicatorHtml(statusId, statusText = 'Ready') {
        return `
        <div class="status-indicator-wrapper">
            <span>Status:</span>
            <span id="${statusId}" class="status-badge pending">${statusText}</span>
        </div>`;
    }

    // Navigation and UI Interaction Functionality
    document.addEventListener('click', (e) => {
        const navLink = e.target.closest('.nav-link');
        if (navLink) {
            e.preventDefault();
            const target = navLink.getAttribute('data-target');
            if (target) {
                // Add click animation to the nav link
                navLink.classList.add('nav-link-clicked');
                setTimeout(() => navLink.classList.remove('nav-link-clicked'), 300);
                
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
                window.history.pushState(null, '', `#${target}`);
                loadSection(target);
            }
        }

        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn) {
            const tabControl = tabBtn.closest('.tab-control');
            const tabPanel = tabBtn.getAttribute('data-tab');
            
            // Add click animation to the tab button
            tabBtn.classList.add('tab-btn-clicked');
            setTimeout(() => tabBtn.classList.remove('tab-btn-clicked'), 300);
            
            tabControl.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            tabBtn.classList.add('active');
            
            // Add fade transition for tab panels
            const tabPanels = tabControl.closest('.card').querySelectorAll('.tab-panel');
            tabPanels.forEach(panel => {
                if (panel.id === tabPanel) {
                    panel.classList.add('fade-in');
                    panel.classList.add('active');
                    setTimeout(() => panel.classList.remove('fade-in'), 500);
                } else {
                    panel.classList.remove('active');
                }
            });
        }

        const locusInput = e.target.closest('#locusTagInput, #locusTagOptInput');
        if (locusInput) {
            console.log('Locus input clicked');
            const tabControl = locusInput.closest('.card').querySelector('.tab-control');
            const locusTabBtn = tabControl.querySelector('[data-tab="locus-tab"], [data-tab="locus-opt-tab"]');
            if (locusTabBtn && !locusTabBtn.classList.contains('active')) {
                tabControl.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                locusTabBtn.classList.add('active');
                locusInput.closest('.card').querySelectorAll('.tab-panel').forEach(panel => {
                    panel.classList.toggle('active', panel.id === locusTabBtn.getAttribute('data-tab'));
                });
            }
        }

        const predictBtn = e.target.closest('#predictBtn');
        if (predictBtn) {
            console.log('Predict button clicked');
            
            // Add click animation
            predictBtn.classList.add('button-clicked');
            setTimeout(() => predictBtn.classList.remove('button-clicked'), 300);
            
            const utr = document.getElementById('utrInputPredictor')?.value || '';
            const cds = document.getElementById('cdsInputPredictor')?.value || '';
            
            // Save the original status indicator HTML
            const statusContainer = document.getElementById('predStatus').closest('.status-indicator');
            const originalStatusHtml = statusContainer.innerHTML;
            
            // Replace with DNA loader - using our enhanced DNA loader
            statusContainer.innerHTML = createDnaLoaderHtml();
            document.getElementById('predictionResult').querySelector('.results-content').innerHTML = 
                '<p class="placeholder-text animate-pulse">Calculating initiation rate...</p>';
                
            fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ utr, cds })
            })
            .then(response => response.json())
            .then(data => {
                // Restore the original status indicator with enhanced version
                statusContainer.innerHTML = createStatusIndicatorHtml('predStatus');
                
                const status = document.getElementById('predStatus');
                status.classList.remove('pending', 'processing');
                if (data.error) {
                    status.classList.add('error');
                    status.textContent = 'Error';
                    document.getElementById('predictionResult').querySelector('.results-content').textContent = data.error;
                } else {
                    status.classList.add('completed');
                    status.textContent = 'Completed';
                    
                    // Enhanced result display with animation
                    const resultContent = document.getElementById('predictionResult').querySelector('.results-content');
                    resultContent.innerHTML = '';
                    
                    const resultElement = document.createElement('div');
                    resultElement.classList.add('result-value', 'fade-in');
                    resultElement.innerHTML = `<strong>Predicted Initiation Rate:</strong> ${data.predictedRate}`;
                    
                    resultContent.appendChild(resultElement);
                }
            })
            .catch(error => {
                console.error('Prediction error:', error);
                // Restore the original status indicator with enhanced version
                statusContainer.innerHTML = createStatusIndicatorHtml('predStatus');
                
                const status = document.getElementById('predStatus');
                status.classList.remove('pending', 'processing');
                status.classList.add('error');
                status.textContent = 'Error';
                document.getElementById('predictionResult').querySelector('.results-content').textContent = 'Prediction failed';
            });
        }

        const optimizeBtn = e.target.closest('#optimizeBtn');
        if (optimizeBtn) {
            console.log('Optimize button clicked');
            
            // Add click animation
            optimizeBtn.classList.add('button-clicked');
            setTimeout(() => optimizeBtn.classList.remove('button-clicked'), 300);
            
            const utr = document.getElementById('utrInput')?.value || '';
            const cds = document.getElementById('cdsInput')?.value || '';
            const targetRate = document.getElementById('targetRate')?.value || '0.1';
            const iterations = document.getElementById('iterations')?.value || '1000';
            
            // Save the original status indicator HTML
            const statusContainer = document.querySelector('.status-indicator');
            const originalStatusHtml = statusContainer.innerHTML;
            
            // Replace with DNA loader - using our enhanced DNA loader
            statusContainer.innerHTML = createDnaLoaderHtml();
            document.getElementById('optimizationResult').querySelector('.results-content').innerHTML = 
                '<p class="placeholder-text animate-pulse">Optimizing sequence...</p>';
            
            fetch('/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ utr, cds, targetRate, iterations })
            })
            .then(response => response.json())
            .then(data => {
                // Restore the original status indicator with enhanced version
                statusContainer.innerHTML = createStatusIndicatorHtml('optStatus');
                
                // Update status
                const status = document.getElementById('optStatus');
                status.classList.remove('pending', 'processing');
                if (data.error) {
                    status.classList.add('error');
                    status.textContent = 'Error';
                    document.getElementById('optimizationResult').querySelector('.results-content').textContent = data.error;
                } else {
                    status.classList.add('completed');
                    status.textContent = 'Completed';
                    
                    // Enhanced result display with sequence highlight animation
                    const resultContent = document.getElementById('optimizationResult').querySelector('.results-content');
                    resultContent.innerHTML = '';
                    
                    // Create result items with staggered animation
                    const utrResultElem = document.createElement('div');
                    utrResultElem.classList.add('result-item', 'fade-in');
                    utrResultElem.style.animationDelay = '0s';
                    utrResultElem.innerHTML = `
                        <span class="result-label">Optimized UTR:</span> 
                        <span class="sequence-highlight">${data.optimizedUTR}</span>
                    `;
                    
                    const rateResultElem = document.createElement('div');
                    rateResultElem.classList.add('result-item', 'fade-in');
                    rateResultElem.style.animationDelay = '0.2s';
                    rateResultElem.innerHTML = `
                        <span class="result-label">Predicted Initiation Rate:</span> 
                        <span class="rate-value">${data.predictedRate}</span>
                    `;
                    
                    resultContent.appendChild(utrResultElem);
                    resultContent.appendChild(rateResultElem);
                }
            })
            .catch(error => {
                console.error('Optimization error:', error);
                // Restore the original status indicator with enhanced version
                statusContainer.innerHTML = createStatusIndicatorHtml('optStatus');
                
                const status = document.getElementById('optStatus');
                status.classList.remove('pending', 'processing');
                status.classList.add('error');
                status.textContent = 'Error';
                document.getElementById('optimizationResult').querySelector('.results-content').textContent = 'Optimization failed';
            });
        }

        const currentTirBtn = e.target.closest('#currentTirBtn');
        if (currentTirBtn) {
            console.log('Current TIR button clicked');
            
            // Add click animation
            currentTirBtn.classList.add('button-clicked');
            setTimeout(() => currentTirBtn.classList.remove('button-clicked'), 300);
            
            const utr = document.getElementById('utrInput')?.value || '';
            const cds = document.getElementById('cdsInput')?.value || '';
            
            // Save the original status indicator HTML
            const statusContainer = document.querySelector('.status-indicator');
            const originalStatusHtml = statusContainer.innerHTML;
            
            // Replace with DNA loader - using our enhanced DNA loader
            statusContainer.innerHTML = createDnaLoaderHtml();
            document.getElementById('optimizationResult').querySelector('.results-content').innerHTML = 
                '<p class="placeholder-text animate-pulse">Calculating current TIR...</p>';
            
            fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ utr, cds })
            })
            .then(response => response.json())
            .then(data => {
                // Restore the original status indicator with enhanced version
                statusContainer.innerHTML = createStatusIndicatorHtml('optStatus');
                
                const status = document.getElementById('optStatus');
                status.classList.remove('pending', 'processing');
                if (data.error) {
                    status.classList.add('error');
                    status.textContent = 'Error';
                    document.getElementById('optimizationResult').querySelector('.results-content').textContent = data.error;
                } else {
                    status.classList.add('completed');
                    status.textContent = 'Completed';
                    
                    // Enhanced result display with animation
                    const resultContent = document.getElementById('optimizationResult').querySelector('.results-content');
                    resultContent.innerHTML = '';
                    
                    const resultElement = document.createElement('div');
                    resultElement.classList.add('result-value', 'fade-in');
                    resultElement.innerHTML = `<strong>Current Initiation Rate:</strong> ${data.predictedRate}`;
                    
                    resultContent.appendChild(resultElement);
                }
            })
            .catch(error => {
                console.error('Prediction error:', error);
                // Restore the original status indicator with enhanced version
                statusContainer.innerHTML = createStatusIndicatorHtml('optStatus');
                
                const status = document.getElementById('optStatus');
                status.classList.remove('pending', 'processing');
                status.classList.add('error');
                status.textContent = 'Error';
                document.getElementById('optimizationResult').querySelector('.results-content').textContent = 'Prediction failed';
            });
        }
    });

    document.addEventListener('focus', (e) => {
        const locusInput = e.target.closest('#locusTagInput, #locusTagOptInput');
        if (locusInput) {
            console.log('Locus input focused');
            const tabControl = locusInput.closest('.card').querySelector('.tab-control');
            const locusTabBtn = tabControl.querySelector('[data-tab="locus-tab"], [data-tab="locus-opt-tab"]');
            if (locusTabBtn && !locusTabBtn.classList.contains('active')) {
                tabControl.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                locusTabBtn.classList.add('active');
                locusInput.closest('.card').querySelectorAll('.tab-panel').forEach(panel => {
                    panel.classList.toggle('active', panel.id === locusTabBtn.getAttribute('data-tab'));
                });
            }
        }
    }, true);

    // File Upload Handling
    const fileUpload = document.getElementById('fileUpload');
    const fileName = document.getElementById('fileName');
    if (fileUpload && fileName) {
        fileUpload.addEventListener('change', (e) => {
            fileName.textContent = e.target.files.length ? e.target.files[0].name : 'No file selected';
            
            // Animate the file name display
            fileName.classList.add('file-name-updated');
            setTimeout(() => fileName.classList.remove('file-name-updated'), 500);
        });
    }
});