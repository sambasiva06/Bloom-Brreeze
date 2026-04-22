document.addEventListener('DOMContentLoaded', () => {

    // 1. Aesthetic Preloader 
    const preloader = document.getElementById('preloader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 1000);
            }
        }, 1500); 
    });

    // 2. Mobile Sidebar Menu and Hamburger Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileSidebar = document.querySelector('.mobile-sidebar');
    const sidebarCloseBtn = document.querySelector('.sidebar-close-btn');
    
    if (mobileMenuBtn && mobileSidebar && sidebarCloseBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileSidebar.classList.add('active');
        });
        
        sidebarCloseBtn.addEventListener('click', () => {
            mobileSidebar.classList.remove('active');
        });

        document.querySelectorAll('.sidebar-links a').forEach(link => {
            link.addEventListener('click', () => {
                mobileSidebar.classList.remove('active');
            });
        });
    }

    // ── LENIS SMOOTH SCROLL (Used by Stripe, Linear, Vercel, Framer)
    // Gives that premium inertia / momentum feel on all browsers
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,           // scroll animation duration (seconds)
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
            smooth: true,
            mouseMultiplier: 1.0,
            smoothTouch: false,      // off on touch — native feels better on mobile
            touchMultiplier: 2,
            infinite: false,
        });
        // Drive Lenis on every RAF frame
        function lenisRaf(time) {
            lenis.raf(time);
            requestAnimationFrame(lenisRaf);
        }
        requestAnimationFrame(lenisRaf);
    }

    const navbar         = document.getElementById('navbar');
    const heroBg         = document.querySelector('.hero-zoom-bg');
    const galleryWrapper = document.querySelector('.gallery-horizontal-wrapper');
    const horizontalSlider = document.getElementById('horizontal-slider');

    // Cache layout values — reading these inside scroll causes forced reflow
    let cachedWrapperTop    = 0;
    let cachedWrapperHeight = 0;
    let cachedSliderWidth   = 0;

    function cacheGalleryDimensions() {
        if (galleryWrapper && horizontalSlider) {
            const rect = galleryWrapper.getBoundingClientRect();
            cachedWrapperTop    = rect.top + window.scrollY;
            cachedWrapperHeight = galleryWrapper.offsetHeight;
            cachedSliderWidth   = horizontalSlider.scrollWidth;
        }
    }

    // IMPORTANT: Cache AFTER all images are loaded — images affect layout height.
    // Caching at DOMContentLoaded gives wrong Y positions (images not loaded = wrong height).
    window.addEventListener('load', () => {
        cacheGalleryDimensions();
        // Second cache after 500ms as safety net for late-loading images
        setTimeout(cacheGalleryDimensions, 500);
    });

    // Re-cache on resize (debounced — only fires 150ms after resize stops)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(cacheGalleryDimensions, 150);
    }, { passive: true });

    let latestScrollY = 0;
    let ticking = false;

    function updateOnScroll() {
        latestScrollY = window.scrollY;
        if (!ticking) {
            requestAnimationFrame(performUpdates);
            ticking = true;
        }
    }

    function performUpdates() {
        const scrollY      = latestScrollY;
        const windowHeight = window.innerHeight;
        const windowWidth  = window.innerWidth;

        // Navbar: add/remove scrolled class with single classList check
        if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > 50);
        }

        // Hero Parallax — only while hero is in viewport
        if (heroBg && scrollY < windowHeight) {
            const scale     = Math.max(0.9, 1 - scrollY * 0.0002);
            const translateY = scrollY * 0.15;
            heroBg.style.transform = `scale(${scale}) translateY(${translateY}px) translateZ(0)`;
        }

        // Horizontal Gallery — uses cached values, zero reflow
        if (galleryWrapper && horizontalSlider) {
            const endScroll = cachedWrapperTop + cachedWrapperHeight - windowHeight;

            if (scrollY >= cachedWrapperTop && scrollY <= endScroll) {
                const progress = (scrollY - cachedWrapperTop) / (cachedWrapperHeight - windowHeight);
                const clampedProgress = Math.min(Math.max(progress, 0), 1);
                const maxH = cachedSliderWidth - windowWidth;
                horizontalSlider.style.transform = `translateX(-${clampedProgress * maxH}px) translateZ(0)`;
            } else if (scrollY < cachedWrapperTop) {
                horizontalSlider.style.transform = `translateX(0px) translateZ(0)`;
            } else {
                horizontalSlider.style.transform = `translateX(-${cachedSliderWidth - windowWidth}px) translateZ(0)`;
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', updateOnScroll, { passive: true });

    // 5. Scroll Reveal — Intersection Observer with refined thresholds
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // stop watching after reveal
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -30px 0px'
        });
        revealElements.forEach(el => revealObserver.observe(el));
    }


    // 6. Premium Smooth Anchor Scroll (ease-in-out cubic, 60fps RAF)
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function smoothScrollTo(targetY, duration = 700) {
        const startY    = window.scrollY;
        const distance  = targetY - startY;
        let startTime   = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed  = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease     = easeInOutCubic(progress);
            window.scrollTo(0, startY + distance * ease);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (!targetEl) return;
            e.preventDefault();
            const navHeight = navbar ? navbar.offsetHeight : 0;
            const targetY   = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;
            smoothScrollTo(targetY, 700);
        });
    });

    // --- DYNAMIC MENU LOADING FROM API ---
    let menuData = {};
    let categoryImages = {};

    async function fetchDynamicMenu() {
        const API_URL = 'https://opensheet.elk.sh/1YxQHRN1I54pNH00nb3MTYsTNl0rVNCRMdJwsMblVesc/Menu';
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            
            // Process API data into categories with flexible header mapping
            data.forEach(item => {
                // Flexible mapping for client-friendly headers
                const name = item['ITEM NAME'] || item['Name'] || item['item name'] || "Untitled Item";
                const price = item['Final Cost'] || item['Price'] || item['price'] || "0";
                const desc = item['DESCRIPTION'] || item['Description'] || item['description'] || "";
                const cat = item['CATEGORY'] || item['Category'] || item['category'] || "Uncategorized";
                const diet = item['Veg/Non Veg'] || item['Diet'] || item['diet'] || "";
                const img = item['Image'] || item['image'] || 'images/logo.jpg';

                if (!menuData[cat]) {
                    menuData[cat] = [];
                    // Use the first item's image as the category cover
                    categoryImages[cat] = img;
                }
                
                menuData[cat].push({
                    name: name,
                    desc: desc,
                    price: String(price).replace('₹', '').trim(),
                    diet: diet,
                    image: img
                });
            });

            // Once data is ready, initialize the menu
            if (document.getElementById('category-grid')) {
                initMenu();
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            // Fallback or error handling could go here
        }
    }




    function initMenu() {
        const grid = document.getElementById('category-grid');
        if (!grid) return;

        grid.innerHTML = '';
        Object.keys(menuData).forEach((cat, index) => {
            const card = document.createElement('div');
            card.className = "category-card reveal reveal-up";
            card.style.transitionDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <img src="${categoryImages[cat] || 'images/logo.jpg'}" alt="${cat}" loading="lazy">
                <div class="category-info">
                    <h3>${cat}</h3>
                    <p>${menuData[cat].length} Items</p>
                </div>
            `;
            card.onclick = () => showMenu(cat);
            grid.appendChild(card);
            setTimeout(() => card.classList.add('active'), 100);
        });
        initSearch(); // Initialize search after menu is ready
    }

    function initSearch() {
        const searchInput = document.getElementById('menu-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const grid = document.getElementById('category-grid');
            const header = document.getElementById('menu-main-header');
            const searchView = document.getElementById('search-results-view');
            const menuView = document.getElementById('menu-view');

            if (query.length < 2) {
                if (searchView) searchView.style.display = 'none';
                if (grid) grid.style.display = 'grid';
                // Don't show header if we are currently in a category view
                if (header && (!menuView || menuView.style.display !== 'block')) {
                    header.style.display = 'block';
                }
                return;
            }

            // Perform search
            const results = [];
            Object.keys(menuData).forEach(category => {
                menuData[category].forEach(item => {
                    if (item.name.toLowerCase().includes(query) || (item.desc && item.desc.toLowerCase().includes(query))) {
                        results.push({ ...item, category });
                    }
                });
            });

            // Display results
            if (grid) grid.style.display = 'none';
            if (menuView) menuView.style.display = 'none';
            if (searchView) {
                searchView.style.display = 'block';
                const resultsList = document.getElementById('search-results-list');
                resultsList.innerHTML = '';

                if (results.length === 0) {
                    resultsList.innerHTML = '<div class="no-results">No matches found for "' + query + '". Try something else!</div>';
                } else {
                    results.forEach((item, idx) => {
                        const li = document.createElement('li');
                        li.className = 'menu-item reveal reveal-up active'; // Set active for search results
                        li.style.transitionDelay = `${idx * 0.05}s`;
                        
                        let dietTag = '';
                        if (item.diet) {
                            let dietClass = '';
                            const dietVal = item.diet.toLowerCase();
                            if (dietVal === 'v') dietClass = 'diet-veg';
                            else if (dietVal === 'nv') dietClass = 'diet-nonveg';
                            else if (dietVal.includes('/')) dietClass = 'diet-hybrid';
                            else dietClass = 'diet-nonveg';
                            dietTag = `<span class="diet-indicator ${dietClass}">${item.diet.toUpperCase()}</span>`;
                        }

                        li.innerHTML = `
                            <div class="item-row">
                                <div class="item-name-wrap">
                                    <span class="item-name">${item.name} <small style="font-size:0.7rem; color:var(--text-accent); opacity:0.7;">(${item.category})</small></span>
                                    ${dietTag}
                                </div>
                                <span class="item-price">₹${item.price}</span>
                            </div>
                            <p class="item-desc">${item.desc || ""}</p>
                        `;
                        resultsList.appendChild(li);
                    });
                }
            }
        });
    }

    const showMenu = (category) => {
        const grid = document.getElementById('category-grid');
        const header = document.getElementById('menu-main-header');
        const view = document.getElementById('menu-view');
        
        if (grid) grid.style.display = 'none';
        if (header) header.style.display = 'none';
        if (view) {
            view.style.display = 'block';
            setTimeout(() => view.classList.add('active'), 50);
            
            document.getElementById('view-title').innerText = category;
            document.getElementById('view-cat-img').src = categoryImages[category] || '';
            
            const list = document.getElementById('items-list');
            list.innerHTML = '';
            menuData[category].forEach((item, idx) => {
                const li = document.createElement('li');
                li.className = 'menu-item reveal reveal-up';
                li.style.transitionDelay = `${idx * 0.05}s`;
                
                // Dietary Indicator Logic
                let dietTag = '';
                if (item.diet) {
                    let dietClass = '';
                    const dietVal = item.diet.toLowerCase();
                    
                    if (dietVal === 'v') dietClass = 'diet-veg';
                    else if (dietVal === 'nv') dietClass = 'diet-nonveg';
                    else if (dietVal.includes('/')) dietClass = 'diet-hybrid';
                    else dietClass = 'diet-nonveg'; // Fallback
                    
                    const dietLabel = item.diet.toUpperCase();
                    dietTag = `<span class="diet-indicator ${dietClass}">${dietLabel}</span>`;
                }

                li.innerHTML = `
                    <div class="item-row">
                        <div class="item-name-wrap">
                            <span class="item-name">${item.name}</span>
                            ${dietTag}
                        </div>
                        <span class="item-price">₹${item.price}</span>
                    </div>
                    <p class="item-desc">${item.desc || ""}</p>
                `;
                list.appendChild(li);
                setTimeout(() => li.classList.add('active'), 100);
            });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.showCategories = () => {
        const grid = document.getElementById('category-grid');
        const header = document.getElementById('menu-main-header');
        const view = document.getElementById('menu-view');
        const searchView = document.getElementById('search-results-view');
        const searchInput = document.getElementById('menu-search');
        
        if (view) view.classList.remove('active');
        if (searchView) searchView.style.display = 'none';
        if (searchInput) searchInput.value = ''; // Reset search

        setTimeout(() => {
            if (view) view.style.display = 'none';
            if (grid) grid.style.display = 'grid';
            if (header) header.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 600);
    };

    if (document.getElementById('category-grid')) {
        fetchDynamicMenu();
    }
});