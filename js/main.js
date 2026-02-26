document.addEventListener('DOMContentLoaded', () => {

    /* --- DYNAMISCHE TABS & NAVIGATION --- */
    const projects = Array.from(document.querySelectorAll('.project'));
    const totalProjects = projects.length;

    document.documentElement.style.setProperty('--total-projects', totalProjects);

    projects.forEach((project, index) => {
        const tab = project.querySelector('.project-tab');
        if (tab) {
            tab.style.left = `calc(${index} * (100% / ${totalProjects}))`;

            // NAVIGATION ALS BUTTON
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const offset = window.innerHeight * 0.15;
                const targetY = project.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });
            });
        }
    });


    /* --- CONTACT OVERLAY PREPARATION --- */
    // With the new sticky contact overlay (z-index: 9500), 
    // the contact section will naturally slide over the projects and tabs.
    // No JS-based tab freezing is required anymore.


    /* --- CUSTOM CURSOR SETUP --- */
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Ensure cursor is visible if it was hidden by some other logic
        if (cursor.style.display === 'none') cursor.style.display = 'flex';
    });

    /* --- THEME TOGGLE --- */
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            // Trigger video refresh because visibility changed
            checkProjectOverlap();
        });
    }


    /* --- GALERIE "FLIP" --- */
    const galleryTriggers = document.querySelectorAll('.gallery-trigger');

    galleryTriggers.forEach(trigger => {
        const isActuallyInGallery = trigger.closest('.project-gallery');

        // Cursor-Handling
        trigger.addEventListener('mouseenter', () => {
            if (isActuallyInGallery) {
                cursor.classList.add('in-gallery');
            }
        });
        trigger.addEventListener('mouseleave', () => {
            cursor.classList.remove('in-gallery');
            cursor.innerHTML = '';
        });

        trigger.addEventListener('mousemove', (e) => {
            if (!isActuallyInGallery) return;

            const rect = trigger.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width / 2) {
                cursor.innerHTML = '←';
            } else {
                cursor.innerHTML = '→';
            }
        });

        trigger.addEventListener('click', (e) => {
            const gallery = e.target.closest('.project-gallery');
            if (!gallery) return;

            const items = Array.from(gallery.querySelectorAll('.gallery-item'));
            const currentItem = e.target.closest('.gallery-item');
            const currentIndex = items.indexOf(currentItem);

            const rect = trigger.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const isLeftClick = x < rect.width / 2;

            let nextIndex;
            if (isLeftClick) {
                nextIndex = currentIndex - 1;
                if (nextIndex < 0) nextIndex = items.length - 1;
            } else {
                nextIndex = currentIndex + 1;
                if (nextIndex >= items.length) nextIndex = 0;
            }

            // Pause videos in current item if they exist
            const currentVideos = currentItem.querySelectorAll('video');
            currentVideos.forEach(v => v.pause());

            currentItem.classList.remove('active');
            const nextItem = items[nextIndex];
            nextItem.classList.add('active');

            // Play videos in next item if they exist and are visible
            const nextVideos = nextItem.querySelectorAll('video');
            nextVideos.forEach(v => {
                if (getComputedStyle(v).display !== 'none') {
                    v.play().catch(err => {
                        // Autoplay might be blocked
                    });
                } else {
                    v.pause();
                }
            });
        });
    });


    /* --- SCROLL-ANIMATION --- */
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    projects.forEach(project => {
        // Wir setzen hier KEINE initiale Opacity 0 mehr per JS, 
        // um Sichtbarkeitsprobleme beim Laden zu vermeiden.
        // Falls Animation gewünscht ist, besser via CSS.
        entry = { isIntersecting: true, target: project }; // Fallback
        project.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(project);
    });


    /* --- VIDEO MEMORY OPTIMIZATION & SOUND --- */

    // Icons for the toggle button
    const iconMuted = `
        <svg viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>`;

    const iconUnmuted = `
        <svg viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>`;

    // Pause videos when they're not visible to save memory
    // Note: Project stacking makes IntersectionObserver less reliable for "covered" states,
    // so we rely on checkProjectOverlap() for primary play/pause logic.
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            // Only pause if completely out of viewport
            if (!entry.isIntersecting) {
                video.pause();
            }
        });
    }, {
        threshold: 0,
        rootMargin: '100px'
    });

    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        // 1. Observer registration
        videoObserver.observe(video);

        // 2. Sound Toggle Injection
        if (video.dataset.sound === 'true') {
            const wrapper = video.closest('.gallery-item');
            if (wrapper) {
                const btn = document.createElement('div');
                btn.className = 'volume-toggle';
                btn.innerHTML = iconMuted; // Start showing muted icon
                btn.title = "Unmute";

                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Don't trigger gallery navigation
                    e.preventDefault();

                    if (video.muted) {
                        video.muted = false;
                        btn.innerHTML = iconUnmuted;
                        btn.title = "Mute";
                    } else {
                        video.muted = true;
                        btn.innerHTML = iconMuted;
                        btn.title = "Unmute";
                    }
                });

                wrapper.appendChild(btn);
            }
        }
    });

    /* --- OVERLAP DETECTION FOR SOUND --- */
    // Mute/Pause videos in previous projects when covered by the next one

    function checkProjectOverlap() {
        const viewportHeight = window.innerHeight;

        projects.forEach((project, index) => {
            const rect = project.getBoundingClientRect();
            const nextProject = projects[index + 1];
            let isCovered = false;

            // 1. Check if covered by the NEXT project (sticky stacking)
            if (nextProject) {
                const nextRect = nextProject.getBoundingClientRect();
                // If the next project has reached its sticky position or is covering this one
                if (nextRect.top <= viewportHeight * 0.15) {
                    isCovered = true;
                }
            }

            // 2. Check if it's scrolled off the BOTTOM or TOP completely
            const isOffScreen = rect.bottom < 0 || rect.top > viewportHeight;

            const projectVideos = project.querySelectorAll('video');

            if (isCovered || isOffScreen) {
                // Project is not the focus -> Pause & Mute
                projectVideos.forEach(v => {
                    if (!v.paused) v.pause();
                });
            } else {
                // Project is currently visible / focus -> Play active video
                const activeItems = project.querySelectorAll('.gallery-item.active');
                activeItems.forEach(item => {
                    const itemVideos = item.querySelectorAll('video');
                    itemVideos.forEach(v => {
                        if (getComputedStyle(v).display !== 'none') {
                            if (v.paused) {
                                v.play().catch(e => {
                                    // Autoplay might be blocked until user interacts
                                });
                            }
                        } else {
                            if (!v.paused) v.pause();
                        }
                    });
                });
            }
        });
    }

    // Throttle scroll event
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                checkProjectOverlap();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    // Initial check on load
    checkProjectOverlap();
});
