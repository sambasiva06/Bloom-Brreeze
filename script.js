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

    // --- MENU PAGE LOGIC ---
    const menuData = {
        "Breakfasts": [
            { name: "The Signature Brekkie Bun (Egg)", desc: "Toasted brioche bun with egg, crispy hash brown, lettuce, and smoky chipotle emulsion.", price: "389", diet: "nv" },
            { name: "The Signature Brekkie Bun (Paneer)", desc: "Toasted brioche bun with paneer, crispy hash brown, lettuce, and smoky chipotle emulsion.", price: "389", diet: "v" },
            { name: "Artisan Egg Toast", desc: "Sourdough, Brown, or Multigrain bread served with eggs your way: Scrambled, Sunny-Side Up, or Omelette.", price: "359", diet: "nv" },
            { name: "Healthy Breakfast", desc: "Fresh fruits, yoghurt, granola, honey, boiled eggs, and multigrain toast.", price: "349", diet: "v/nv", popular: true },
            { name: "English Breakfast", desc: "Classic platter with eggs, chicken sausages, toast, baked beans, tomato, and coffee.", price: "369", diet: "nv" },
            { name: "American Breakfast", desc: "Eggs, chicken sausages, toast, and fluffy pancakes with maple & blueberry.", price: "399", diet: "nv" },
            { name: "Signature French Toast", desc: "Brioche soaked in vanilla custard with choice of Maple & Fruit or Blueberry sauce.", price: "329", diet: "nv" }
        ],
        "Pancakes": [
            { name: "Classic Pancake", desc: "Fluffy golden stacks with seasonal fruits, butter, and maple syrup.", price: "259", diet: "nv", popular: true },
            { name: "Nutella Overload Pancake", desc: "Layered with Nutella, chocolate chips, and fresh fruit.", price: "299", diet: "nv" }
        ],
        "Brunches": [
            { name: "Classic Shakshuka", desc: "Poached eggs in spiced tomato and bell pepper ragout with sourdough spears.", price: "269", diet: "nv" },
            { name: "Thai Green Curry Veg", desc: "Aromatic and creamy green curry served with herbed rice.", price: "340", diet: "v" },
            { name: "Thai Green Curry Chicken", desc: "Aromatic green curry with tender chicken and herbed rice.", price: "390", diet: "nv" },
            { name: "Thai Red Curry Veg", desc: "Bold and spicy red curry with fresh vegetables and rice.", price: "340", diet: "v" },
            { name: "Thai Red Curry Chicken", desc: "Spicy red curry with succulent chicken and herbed rice.", price: "390", diet: "nv" },
            { name: "Paneer Steak", desc: "Grilled cottage cheese with jalapeño cream sauce, herbed rice, and mash.", price: "439", diet: "v", popular: true },
            { name: "Grilled Chicken Steak", desc: "Grilled chicken with silky lemon butter sauce, herbed rice, and mash.", price: "479", diet: "nv" }
        ],
        "Short Eats": [
            { name: "Jalapeno Cheese Poppers", desc: "Golden bites stuffed with gooey melted cheese.", price: "249", diet: "v" },
            { name: "Cheesy Garlic Bread", desc: "Toasted brioche with garlic butter and premium herbs.", price: "279", diet: "v" },
            { name: "Cheesy Nachos", desc: "Loaded with mozzarella, jalapeños, and fresh garden veggies.", price: "259", diet: "v" },
            { name: "Cheesy Nachos chicken", desc: "Loaded with mozzarella, chicken, jalapeños, and fresh veggies.", price: "289", diet: "nv" },
            { name: "Chicken Wings", desc: "Crispy chicken wings tossed in our signature glaze.", price: "267", diet: "nv" },
            { name: "Veggie Fingers", desc: "Crispy breaded vegetable fingers served with dip.", price: "167", diet: "v" },
            { name: "Fries - Classic", desc: "Golden crispy fries lightly seasoned with salt.", price: "149", diet: "v" },
            { name: "Fries - Peri Peri", desc: "Crispy fries tossed in bold, spicy peri-peri seasoning.", price: "169", diet: "v" },
            { name: "Fries - Cheesy", desc: "Hot crispy fries smothered in rich, creamy melted cheese.", price: "199", diet: "v" }
        ],
        "The Pasta Kitchen": [
            { name: "Classic Alfredo Veg", desc: "Rich, creamy white sauce with Parmesan and herbs.", price: "349", diet: "v" },
            { name: "Classic Alfredo Non-Veg", desc: "Rich, creamy white sauce with Parmesan, herbs, and grilled chicken.", price: "389", diet: "nv", popular: true },
            { name: "Penne Arrabiata Veg", desc: "A fiery, tangy tomato and chili sauce.", price: "329", diet: "v" },
            { name: "Aglio E Olio Veg", desc: "Traditional garlic, olive oil, and a hint of red chili flakes.", price: "329", diet: "v" },
            { name: "Mac N Cheese", desc: "Classic creamy macaroni in a rich, cheesy sauce.", price: "229", diet: "v" },
            { name: "Nashville Mac N Cheese", desc: "Creamy macaroni topped with spicy Nashville-style crispy chicken.", price: "299", diet: "nv" }
        ],
        "PIZZA Stories": [
            { name: "BBQ Chicken", desc: "Smoky BBQ base, tender chicken, onions, and garden herbs.", price: "459", diet: "nv" },
            { name: "Paneer Corn", desc: "Sweet corn and marinated paneer—a vegetarian star.", price: "419", diet: "v" },
            { name: "Farm House", desc: "Sweet corn and marinated paneer—a vegetarian star.", price: "429", diet: "v" },
            { name: "Margherita", desc: "Classic tomato sauce, mozzarella, and fresh basil.", price: "409", diet: "v", popular: true }
        ],
        "QUESADILLAS": [
            { name: "Fajita Chicken Verde", desc: "Zesty grilled chicken with peppers, onions, and melted cheese.", price: "369", diet: "nv", popular: true },
            { name: "Smoky Chipotle Paneer", desc: "Paneer cubes, corn, and chipotle emulsion pressed to melty perfection.", price: "349", diet: "v" },
            { name: "Golden Corn Pepper", desc: "Sweet corn, bell peppers, and a triple-cheese blend.", price: "329", diet: "v" }
        ],
        "Burgers & Sandwiches": [
            { name: "Paneer Chipotle", desc: "Smoky grilled paneer with fresh veggies and melted cheese.", price: "299", diet: "v" },
            { name: "Chicken Melt", desc: "Grilled chicken, chipotle sauce, and melty cheese on toasted bread.", price: "379", diet: "nv" },
            { name: "Brooklyn Veggie", desc: "House-made veggie patty, lettuce, caramelized onions, and chipotle.", price: "349", diet: "v" },
            { name: "Nashville Paneer", desc: "Golden crunch paneer with Nashville hot spice and brioche.", price: "369", diet: "v" },
            { name: "Nashville Chicken", desc: "Golden crunch chicken with Nashville hot spice and cool mayo.", price: "389", diet: "nv" },
            { name: "The Chicken Smash Burger", desc: "Juicy smashed chicken patty with cheese and signature secret sauce.", price: "389", diet: "nv" }
        ],
        "Salads & Bowls": [
            { name: "Burrito Bowl Veg", desc: "Cilantro-lime rice with beans, peppers, lettuce, and sour cream.", price: "299", diet: "v" },
            { name: "Burrito Bowl Non-Veg", desc: "Cilantro-lime rice with chicken, beans, peppers, and sour cream.", price: "329", diet: "nv" },
            { name: "Caesar Salad (Veg)", desc: "Romaine lettuce with Caesar dressing, parmesan, and croutons.", price: "299", diet: "v" },
            { name: "Caesar Salad (Non-Veg)", desc: "Romaine lettuce with grilled chicken, parmesan, and croutons.", price: "349", diet: "nv" },
            { name: "Watermelon Feta Salad", desc: "Watermelon paired with feta, fresh greens, and citrus dressing.", price: "299", diet: "v" }
        ],
        "Desserts": [
            { name: "Fluffy Cheesecake", desc: "Light and airy cheesecake with a classic buttery crust.", price: "225", diet: "nv", popular: true },
            { name: "Panna Cotta", desc: "Silky smooth Italian cream dessert with berry coulis.", price: "219", diet: "v" },
            { name: "Chocolate Walnut Brownie", desc: "Warm, fudgy brownie with toasted walnut chunks.", price: "225", diet: "nv" }
        ],
        "Cookies": [
            { name: "Chocolate Chip Cookie", desc: "Classic chewy cookie loaded with premium chocolate chips.", price: "67", diet: "nv" },
            { name: "Sugar Free Donut Cookie", desc: "Healthy dough shaped as a donut, lightly sweetened.", price: "75", diet: "v" }
        ],
        "Hot Beverages": [
            { name: "Espresso", desc: "Pure, intense coffee shot.", price: "149" },
            { name: "Americano", desc: "Rich espresso with hot water.", price: "169" },
            { name: "Cappuccino", desc: "Espresso with steamed milk and deep foam.", price: "229" },
            { name: "Flat White", desc: "Smooth espresso with velvet microfoam.", price: "229" },
            { name: "Café Latte", desc: "Espresso with light steamed milk and thin foam.", price: "239" },
            { name: "Café Mocha", desc: "Espresso blended with rich chocolate and steamed milk.", price: "259" },
            { name: "Hot Chocolate", desc: "Classic, velvety chocolate made with premium cocoa.", price: "289" },
            { name: "Affogato", desc: "Espresso poured over creamy vanilla gelato.", price: "249" },
            { name: "Cortado", desc: "Equal parts espresso and warm steamed milk.", price: "180" }
        ],
        "Cold Beverages": [
            { name: "Iced Americano", desc: "Chilled espresso over ice with water.", price: "179" },
            { name: "Classic Cold Coffee", desc: "Our signature smooth iced coffee.", price: "269" },
            { name: "Vietnamese Coffee", desc: "Traditional drip coffee with sweet condensed milk.", price: "279" },
            { name: "Caramel Frappe", desc: "Blended coffee with rich caramel swirls.", price: "299" },
            { name: "Boba Tea", desc: "Classic milk tea with chewy tapioca pearls.", price: "167" },
            { name: "Blue Lagoon Mocktail", desc: "Sparkling blue citrus refreshment.", price: "199" },
            { name: "Brownie Loaded Shake", desc: "Thick milkshake topped with brownie crumbles.", price: "290" }
        ]
    };

    const categoryImages = {
        "Breakfasts": "images/big breakfast plates.avif",
        "Pancakes": "images/pancake.png",
        "Brunches": "images/All Day Brunch.avif",
        "Short Eats": "images/short eatss.jpg",
        "The Pasta Kitchen": "images/pastakitchen.avif",
        "PIZZA Stories": "images/pizza stories.avif",
        "QUESADILLAS": "images/QUESADILLAS.avif",
        "Burgers & Sandwiches": "images/Burgers & Sandwiches.avif",
        "Salads & Bowls": "images/salads and bowls.avif",
        "Desserts": "images/cheescake.jpg",
        "Cookies": "images/cookies.avif",
        "Hot Beverages": "images/hot beverages.jpg",
        "Cold Beverages": "images/cold beverages.jpg"
    };



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
        initMenu();
    }
});