// Dynamically load Firebase so the rest of the page works even if CDN is blocked
let initializeApp, getAnalytics, isSupported, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider, signInWithPopup;
let firebaseModulesLoaded = false;
(async () => {
    try {
        const appMod = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const analyticsMod = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js");
        const authMod = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
        initializeApp = appMod.initializeApp;
        getAnalytics = analyticsMod.getAnalytics;
        isSupported = analyticsMod.isSupported;
        getAuth = authMod.getAuth;
        createUserWithEmailAndPassword = authMod.createUserWithEmailAndPassword;
        signInWithEmailAndPassword = authMod.signInWithEmailAndPassword;
        GoogleAuthProvider = authMod.GoogleAuthProvider;
        FacebookAuthProvider = authMod.FacebookAuthProvider;
        GithubAuthProvider = authMod.GithubAuthProvider;
        signInWithPopup = authMod.signInWithPopup;
        firebaseModulesLoaded = true;
    } catch (e) {
        console.warn("Firebase modules failed to load. Auth features may be unavailable.", e);
    }
})();

const firebaseConfig = {
    apiKey: "AIzaSyBfCHLXcfs8zLNCzrKHRmOyKOOyIMHNCLw",
    authDomain: "tasklyst-0.firebaseapp.com",
    projectId: "tasklyst-0",
    storageBucket: "tasklyst-0.firebasestorage.app",
    messagingSenderId: "835577405253",
    appId: "1:835577405253:web:b372aff7649b07d788682c",
    measurementId: "G-ESSNPPXQZW"
};

let auth = null;
(async () => {
    if (!firebaseModulesLoaded) return;
    try {
        const firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        try {
            const supported = await isSupported();
            if (supported) {
                getAnalytics(firebaseApp);
            }
        } catch (error) {
            console.error("Analytics initialization failed", error);
        }
    } catch (e) {
        console.warn("Firebase init failed. Auth features unavailable.", e);
    }
})();

// Hue slider
const hueSlider = document.getElementById('neonHue');

const setNeonColor = (hue) => {
    const color = `hsl(${hue}, 100%, 50%)`;
    document.documentElement.style.setProperty('--neon-color', color);
};

if (hueSlider) {
    const minHue = 0;
    const maxHue = 360;
    hueSlider.min = minHue;
    hueSlider.max = maxHue;
    if (!hueSlider.value) hueSlider.value = 120;
    setNeonColor(hueSlider.value);
    hueSlider.addEventListener('input', (event) => setNeonColor(event.target.value));
}

// Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    const statusEl = signupForm.querySelector('.auth-status');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = emailInput?.value.trim();
        const password = passwordInput?.value || '';
        if (!email || !password) {
            if (statusEl) { statusEl.textContent = 'Please fill in all required fields.'; statusEl.classList.add('error'); }
            return;
        }
        if (!auth || !createUserWithEmailAndPassword) {
            if (statusEl) { statusEl.textContent = 'Authentication is unavailable. Please check your connection and try again.'; statusEl.classList.add('error'); }
            return;
        }
        if (statusEl) { statusEl.textContent = 'Creating your account...'; statusEl.classList.remove('error'); }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            if (statusEl) { statusEl.textContent = 'Account created! Redirecting to sign in...'; statusEl.classList.remove('error'); }
            setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        } catch (error) {
            const message = error?.message || 'Something went wrong. Please try again.';
            if (statusEl) { statusEl.textContent = message; statusEl.classList.add('error'); }
        }
    });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const statusEl = loginForm.querySelector('.auth-status');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = emailInput?.value.trim();
        const password = passwordInput?.value || '';
        if (!email || !password) {
            if (statusEl) { statusEl.textContent = 'Please fill in all required fields.'; statusEl.classList.add('error'); }
            return;
        }
        if (!auth || !signInWithEmailAndPassword) {
            if (statusEl) { statusEl.textContent = 'Authentication is unavailable. Please check your connection and try again.'; statusEl.classList.add('error'); }
            return;
        }
        if (statusEl) { statusEl.textContent = 'Signing you in...'; statusEl.classList.remove('error'); }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (statusEl) { statusEl.textContent = 'Signed in! Redirecting...'; }
            setTimeout(() => { window.location.href = 'index.html'; }, 800);
        } catch (error) {
            const message = error?.message || 'Unable to sign in. Please try again.';
            if (statusEl) { statusEl.textContent = message; statusEl.classList.add('error'); }
        }
    });
}

// Social providers
const providerButtons = document.querySelectorAll('.provider-btn');
if (providerButtons.length) {
    providerButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            if (!auth || !signInWithPopup || !GoogleAuthProvider) {
                const form = document.getElementById('loginForm') || document.getElementById('signupForm');
                const statusEl = form?.querySelector('.auth-status');
                if (statusEl) {
                    statusEl.textContent = 'Authentication is unavailable. Please check your connection and try again.';
                    statusEl.classList.add('error');
                }
                return;
            }
            const providerKey = button.dataset.provider;
            const providerMap = {
                google: new GoogleAuthProvider(),
                facebook: new FacebookAuthProvider(),
                github: new GithubAuthProvider()
            };
            const provider = providerMap[providerKey];
            if (!provider) return;
            try {
                await signInWithPopup(auth, provider);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Provider sign-in failed', error);
                const form = document.getElementById('loginForm') || document.getElementById('signupForm');
                const statusEl = form?.querySelector('.auth-status');
                if (statusEl) {
                    statusEl.textContent = error?.message || 'Provider sign-in failed.';
                    statusEl.classList.add('error');
                }
            }
        });
    });
}

// Hero panel expand on category click
const heroEl = document.querySelector('.hero');
const categoryCards = document.querySelectorAll('.category-card');
const categoryCardsContainer = document.querySelector('.category-cards');
if (heroEl && (categoryCards.length || categoryCardsContainer)) {
    const navEl = document.querySelector('.glass-nav');
    const panelEl = document.querySelector('.hero-panel');
    const categoryActionsEl = panelEl?.querySelector('.category-actions');
    const desiredGapPx = 16;
    let hasExpandedOnce = false;
    let panelHeightWatcher = null;
    let heightReleaseTimeout = null;

    const computeAndSetExpandedHeight = (startState = null) => {
        if (!navEl || !panelEl) return;
        const navRect = navEl.getBoundingClientRect();
        const panelRect = panelEl.getBoundingClientRect();
        const currentGapTop = panelRect.top - navRect.bottom;
        const deltaUp = Math.max(0, currentGapTop - desiredGapPx);
        const computedStyles = window.getComputedStyle(panelEl);
        const startMarginTop = startState?.marginTop ?? (parseFloat(computedStyles.marginTop) || 0);
        const startHeight = startState?.height ?? panelRect.height;

        // Freeze current dimensions
        panelEl.style.marginTop = `${startMarginTop}px`;
        panelEl.style.height = `${startHeight}px`;
        void panelEl.offsetHeight; // reflow to lock start state

        // Target dimensions based on updated content
        const targetMarginTop = Math.max(0, startMarginTop - deltaUp);
        const targetHeight = panelEl.scrollHeight;

        panelEl.style.marginTop = `${targetMarginTop}px`;
        panelEl.style.height = `${targetHeight}px`;

        if (!panelHeightWatcher) {
            panelHeightWatcher = new ResizeObserver(() => {
                if (!panelEl || panelEl.style.height === 'auto') return;
                const updatedHeight = panelEl.scrollHeight;
                if (!Number.isFinite(updatedHeight) || updatedHeight <= 0) return;
                panelEl.style.height = `${updatedHeight}px`;
            });
            panelHeightWatcher.observe(panelEl);
        }

        if (heightReleaseTimeout) {
            clearTimeout(heightReleaseTimeout);
        }
        heightReleaseTimeout = setTimeout(() => {
            if (!panelEl) return;
            panelEl.style.height = 'auto';
        }, 650);
    };

    // Keep a fixed expanded height; recompute on resize instead of switching to auto

    const handleCardClick = (event) => {
        const targetCard = event.target.closest('.category-card');
        if (!targetCard) return;
        // Always prevent navigation for card clicks
        event.preventDefault();
        const startRect = panelEl?.getBoundingClientRect();
        const startStyles = panelEl ? window.getComputedStyle(panelEl) : null;
        const startState = startRect ? {
            height: startRect.height,
            marginTop: startStyles ? parseFloat(startStyles.marginTop) || 0 : 0
        } : null;
        // If already expanded, just switch the featured card
        if (hasExpandedOnce) {
            if (categoryCardsContainer) {
                categoryCardsContainer.classList.add('cards--featured');
            }
            document.querySelectorAll('.category-card.is-featured').forEach((el) => el.classList.remove('is-featured'));
            targetCard.classList.add('is-featured');
            requestAnimationFrame(() => computeAndSetExpandedHeight(startState));
            return;
        }
        // First click: expand and feature
        heroEl.classList.add('hero--expanded');
        hasExpandedOnce = true;
        panelEl?.setAttribute('data-expanded', 'true');
        if (categoryCardsContainer) {
            categoryCardsContainer.classList.add('cards--featured');
        }
        targetCard.classList.add('is-featured');
        requestAnimationFrame(() => computeAndSetExpandedHeight(startState));
    };

    if (categoryCardsContainer) {
        categoryCardsContainer.addEventListener('click', handleCardClick);
    } else {
        categoryCards.forEach((card) => {
            card.addEventListener('click', handleCardClick);
        });
    }

    // Keep position correct on resize while expanded
    window.addEventListener('resize', () => {
        if (heroEl.classList.contains('hero--expanded')) {
            requestAnimationFrame(() => computeAndSetExpandedHeight());
        }
    });

    categoryActionsEl?.addEventListener('transitionend', (event) => {
        if (event.propertyName === 'max-height' || event.propertyName === 'height') {
            if (heroEl.classList.contains('hero--expanded')) {
                requestAnimationFrame(() => computeAndSetExpandedHeight());
            }
        }
    });
}

// Footer year
const footerYearEl = document.getElementById('footerYear');
if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
}

// Centered scroll for specific anchors
const centeredNavLinks = document.querySelectorAll('a[href="#pricing"], a[href="#contact"]');
centeredNavLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = document.querySelector(hash);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        history.pushState(null, '', hash);
    });
});

// Scroll to top on refresh / load to avoid offset from previous hash
window.addEventListener('load', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

