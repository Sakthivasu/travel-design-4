
/* =========================================================
   VELMORA — DESIGN 04
   Luxury Hotels & Resorts
   Main JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =====================================================
       01. GLOBAL HELPERS
    ===================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        Array.from(parent.querySelectorAll(selector));

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const safeText = (value, fallback = "—") => {
        const cleaned = String(value ?? "").trim();
        return cleaned || fallback;
    };

    const formatDate = (value) => {
        if (!value) return "Not selected";

        const date = new Date(`${value}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const localDateString = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    /* =====================================================
       02. TOAST NOTIFICATION
    ===================================================== */

    let toastTimeout;

    function showToast(message, duration = 3200) {

        const toast = $("#toast-message");
        const toastText = $("#toast-text");

        if (!toast || !toastText) {
            console.log(message);
            return;
        }

        toastText.textContent = message;

        toast.classList.add("show");
        toast.classList.add("active");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
            toast.classList.remove("active");
        }, duration);
    }


    /* =====================================================
       03. PRELOADER
    ===================================================== */

    const preloader = $("#preloader");
    const progressBar = $("#preloader-progress-bar");
    const progressPercent = $("#preloader-percent");
    const loadingMessage = $("#preloader-message");

    let loadingProgress = 0;
    let preloaderFinished = false;
    let loadingInterval = null;

    function updateLoadingProgress(value) {

        loadingProgress = Math.min(100, Math.max(0, value));

        if (progressBar) {
            progressBar.style.width = `${loadingProgress}%`;
        }

        if (progressPercent) {
            progressPercent.textContent =
                `${Math.round(loadingProgress)}%`;
        }

        if (loadingMessage) {

            if (loadingProgress < 35) {
                loadingMessage.textContent =
                    "Preparing your experience...";
            } else if (loadingProgress < 70) {
                loadingMessage.textContent =
                    "Discovering extraordinary stays...";
            } else if (loadingProgress < 100) {
                loadingMessage.textContent =
                    "Creating your moment of escape...";
            } else {
                loadingMessage.textContent =
                    "Welcome to VELMORA.";
            }
        }
    }

    function hidePreloader() {

        if (preloaderFinished) return;

        preloaderFinished = true;

        if (loadingInterval) {
            clearInterval(loadingInterval);
        }

        updateLoadingProgress(100);

        if (preloader) {

            setTimeout(() => {

                preloader.classList.add("is-hidden");
                document.body.classList.remove("is-loading");

                setTimeout(() => {
                    preloader.style.display = "none";
                }, prefersReducedMotion ? 20 : 900);

            }, prefersReducedMotion ? 0 : 350);
        }
    }

    if (preloader) {

        document.body.classList.add("is-loading");

        updateLoadingProgress(5);

        loadingInterval = setInterval(() => {

            if (loadingProgress < 88) {

                const increment =
                    Math.random() * 7 + 2;

                updateLoadingProgress(
                    Math.min(88, loadingProgress + increment)
                );
            }

        }, 250);

        if (document.readyState === "complete") {
            hidePreloader();
        } else {
            window.addEventListener(
                "load",
                hidePreloader,
                { once: true }
            );
        }

        // Safety fallback: do not trap the visitor.
        setTimeout(hidePreloader, 5000);

        // Back/forward cache: never restore a page with a stuck loader.
        window.addEventListener("pageshow", event => {
            if (event.persisted) {
                preloaderFinished = true;
                document.body.classList.remove("is-loading", "menu-open");
                preloader.classList.add("is-hidden");
                preloader.style.display = "none";
            }
        });
    }


    /* =====================================================
       05. MOBILE NAVIGATION
    ===================================================== */

    const menuToggle = $("#menu-toggle");
    const mainNav = $("#main-nav");

    function openMobileMenu() {

        if (!menuToggle || !mainNav) return;

        menuToggle.classList.add("active");
        mainNav.classList.add("active");

        document.body.classList.add("menu-open");

        menuToggle.setAttribute("aria-expanded", "true");
    }

    function closeMobileMenu() {

        if (!menuToggle || !mainNav) return;

        menuToggle.classList.remove("active");
        mainNav.classList.remove("active");

        document.body.classList.remove("menu-open");

        menuToggle.setAttribute("aria-expanded", "false");
    }

    if (menuToggle && mainNav) {

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.addEventListener("click", () => {

            const isOpen =
                mainNav.classList.contains("active");

            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        $$(".main-nav a").forEach(link => {
            link.addEventListener("click", closeMobileMenu);
        });

        document.addEventListener("click", event => {

            const clickedInsideNav =
                mainNav.contains(event.target);

            const clickedToggle =
                menuToggle.contains(event.target);

            if (!clickedInsideNav && !clickedToggle) {
                closeMobileMenu();
            }
        });

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeMobileMenu();
            }
        });

        window.addEventListener("resize", () => {

            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }


    /* =====================================================
       06. ACTIVE NAVIGATION LINK
    ===================================================== */

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    $$(".main-nav a").forEach(link => {

        const href = link.getAttribute("href");

        if (!href) return;

        const linkPage = href.split("?")[0].split("#")[0];

        if (linkPage === currentPage) {

            link.classList.add("active");

            link.setAttribute("aria-current", "page");
        }
    });


    /* =====================================================
       07. STICKY HEADER
    ===================================================== */

    const siteHeader = $("#site-header");

    function handleHeaderScroll() {

        if (!siteHeader) return;

        if (window.scrollY > 70) {
            siteHeader.classList.add("scrolled");
        } else {
            siteHeader.classList.remove("scrolled");
        }
    }

    window.addEventListener(
        "scroll",
        handleHeaderScroll,
        { passive: true }
    );

    handleHeaderScroll();


    /* =====================================================
       08. SCROLL REVEAL
    ===================================================== */

    const revealElements = $$(".reveal, .reveal-left, .reveal-right");

    if ("IntersectionObserver" in window && !prefersReducedMotion) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);
                    }
                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("visible");
        });
    }


    /* =====================================================
       09. CURRENT YEAR
    ===================================================== */

    const currentYear = $("#current-year");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    /* =====================================================
       10. BACK TO TOP
    ===================================================== */

    const backToTop = $("#back-to-top");

    function handleBackToTop() {

        if (!backToTop) return;

        if (window.scrollY > 450) {
            backToTop.classList.add("visible");
        } else {
            backToTop.classList.remove("visible");
        }
    }

    window.addEventListener(
        "scroll",
        handleBackToTop,
        { passive: true }
    );

    handleBackToTop();

    if (backToTop) {

        backToTop.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? "instant" : "smooth"
            });
        });
    }


    /* =====================================================
       11. HOTEL FILTER SYSTEM
    ===================================================== */

    const hotelGrid = $("#hotel-grid");

    if (hotelGrid) {

        const hotelCards = $$(".hotel-card", hotelGrid);

        const destinationSelect = $("#hotel-destination");
        const typeSelect = $("#hotel-type");
        const searchButton = $("#hotel-search-btn");

        const filterButtons =
            $$("[data-hotel-filter]");

        const resultsCount = $("#hotel-results-count");
        const emptyMessage = $("#hotel-empty-message");

        let activeHotelFilter = "all";

        function filterHotels() {

            const destination =
                destinationSelect?.value.toLowerCase() || "all";

            const type =
                typeSelect?.value.toLowerCase() || "all";

            let visibleCount = 0;

            hotelCards.forEach(card => {

                const cardDestination =
                    (card.dataset.destination || "").toLowerCase();

                const cardType =
                    (card.dataset.type || "").toLowerCase();

                const matchesDestination =
                    destination === "all" ||
                    cardDestination === destination;

                const matchesType =
                    type === "all" ||
                    cardType === type;

                const matchesCategory =
                    activeHotelFilter === "all" ||
                    cardType === activeHotelFilter;

                const shouldShow =
                    matchesDestination &&
                    matchesType &&
                    matchesCategory;

                card.hidden = !shouldShow;

                if (shouldShow) {
                    visibleCount++;
                }
            });

            if (resultsCount) {
                resultsCount.textContent =
                    `${visibleCount} ${visibleCount === 1 ? "property" : "properties"} found`;
            }

            if (emptyMessage) {
                emptyMessage.hidden = visibleCount !== 0;
            }
        }

        filterButtons.forEach(button => {

            button.addEventListener("click", () => {

                filterButtons.forEach(item => {
                    item.classList.remove("active");
                });

                button.classList.add("active");

                activeHotelFilter =
                    button.dataset.hotelFilter || "all";

                filterHotels();
            });
        });

        if (searchButton) {
            searchButton.addEventListener("click", filterHotels);
        }

        destinationSelect?.addEventListener("change", filterHotels);
        typeSelect?.addEventListener("change", filterHotels);

        filterHotels();
    }


    /* =====================================================
       12. ROOM FILTER AND SEARCH SYSTEM
    ===================================================== */

    const roomGrid = $("#room-grid");

    if (roomGrid) {

        const roomCards = $$(".room-card", roomGrid);

        const destinationSelect = $("#room-destination");
        const guestsSelect = $("#room-guests");
        const viewSelect = $("#room-view");
        const searchButton = $("#room-search-btn");

        const filterButtons = $$(".room-filter-btn");

        const sortSelect = $("#room-sort-select");

        const emptyMessage = $("#room-empty-message");
        const resetButton = $("#reset-room-filters");

        let activeRoomFilter = "all";

        function applyRoomFilters() {

            const destination =
                destinationSelect?.value.toLowerCase() || "all";

            const guests =
                Number(guestsSelect?.value || 0);

            const view =
                viewSelect?.value.toLowerCase() || "all";

            let visibleCount = 0;

            roomCards.forEach(card => {

                const categories =
                    (card.dataset.category || "")
                        .toLowerCase()
                        .split(/\s+/)
                        .filter(Boolean);

                const cardDestination =
                    (card.dataset.destination || "").toLowerCase();

                const cardGuests =
                    Number(card.dataset.guests || 0);

                const cardView =
                    (card.dataset.view || "").toLowerCase();

                const matchesCategory =
                    activeRoomFilter === "all" ||
                    categories.includes(activeRoomFilter);

                const matchesDestination =
                    destination === "all" ||
                    cardDestination === destination;

                const matchesGuests =
                    !guests || cardGuests >= guests;

                const matchesView =
                    view === "all" ||
                    cardView === view;

                const shouldShow =
                    matchesCategory &&
                    matchesDestination &&
                    matchesGuests &&
                    matchesView;

                card.hidden = !shouldShow;

                if (shouldShow) {
                    visibleCount++;
                }
            });

            if (emptyMessage) {
                emptyMessage.hidden = visibleCount !== 0;
            }
        }

        filterButtons.forEach(button => {

            button.addEventListener("click", () => {

                filterButtons.forEach(item => {
                    item.classList.remove("active");
                });

                button.classList.add("active");

                activeRoomFilter =
                    button.dataset.filter || "all";

                applyRoomFilters();
            });
        });

        if (searchButton) {
            searchButton.addEventListener(
                "click",
                applyRoomFilters
            );
        }

        destinationSelect?.addEventListener(
            "change",
            applyRoomFilters
        );

        guestsSelect?.addEventListener(
            "change",
            applyRoomFilters
        );

        viewSelect?.addEventListener(
            "change",
            applyRoomFilters
        );


        /* Room sorting */

        function sortRooms() {

            if (!sortSelect) return;

            const sortValue = sortSelect.value;

            const sortedCards = [...roomCards];

            if (sortValue === "low") {

                sortedCards.sort((a, b) =>
                    Number(a.dataset.price || 0) -
                    Number(b.dataset.price || 0)
                );

            } else if (sortValue === "high") {

                sortedCards.sort((a, b) =>
                    Number(b.dataset.price || 0) -
                    Number(a.dataset.price || 0)
                );

            }

            sortedCards.forEach(card => {
                roomGrid.appendChild(card);
            });
        }

        sortSelect?.addEventListener("change", sortRooms);


        /* Reset room filters */

        if (resetButton) {

            resetButton.addEventListener("click", () => {

                if (destinationSelect) destinationSelect.value = "all";
                if (guestsSelect) guestsSelect.value = "all";
                if (viewSelect) viewSelect.value = "all";
                if (sortSelect) sortSelect.value = "default";

                activeRoomFilter = "all";

                filterButtons.forEach(button => {
                    button.classList.toggle(
                        "active",
                        button.dataset.filter === "all"
                    );
                });

                sortRooms();
                applyRoomFilters();

                showToast("Room filters have been reset.");
            });
        }

        sortRooms();
        applyRoomFilters();
    }


    /* =====================================================
       13. ROOM WISHLIST
    ===================================================== */

    $$(".wishlist-btn").forEach(button => {

        button.addEventListener("click", () => {

            const isActive =
                button.classList.toggle("active");

            const icon = $("i", button);

            if (icon) {

                icon.classList.toggle("fa-regular", !isActive);
                icon.classList.toggle("fa-solid", isActive);
            }

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );

            showToast(
                isActive
                    ? "Room added to your favourites."
                    : "Room removed from your favourites."
            );
        });
    });


    /* =====================================================
       14. ROOM BOOKING LINKS
    ===================================================== */

    $$(".room-book-link[data-room]").forEach(link => {

        link.addEventListener("click", () => {

            // The room name is already included in the URL
            // through the HTML href query parameter.
            // The booking page reads it automatically.
        });
    });


    /* =====================================================
       15. OFFERS FILTER SYSTEM
    ===================================================== */

    const offerGrid = $("#offer-grid");

    if (offerGrid) {

        const offerCards = $$(".offer-card", offerGrid);

        const filterButtons =
            $$(".offer-filter-btn");

        const emptyMessage = $("#offer-empty-message");

        const resetButton = $("#reset-offer-filters");

        let activeOfferFilter = "all";

        function filterOffers() {

            let visibleCount = 0;

            offerCards.forEach(card => {

                const category =
                    (card.dataset.offerCategory || "").toLowerCase();

                const matches =
                    activeOfferFilter === "all" ||
                    category === activeOfferFilter;

                card.hidden = !matches;

                if (matches) {
                    visibleCount++;
                }
            });

            if (emptyMessage) {
                emptyMessage.hidden = visibleCount !== 0;
            }
        }

        filterButtons.forEach(button => {

            button.addEventListener("click", () => {

                filterButtons.forEach(item => {
                    item.classList.remove("active");
                });

                button.classList.add("active");

                activeOfferFilter =
                    button.dataset.offerFilter || "all";

                filterOffers();
            });
        });

        if (resetButton) {

            resetButton.addEventListener("click", () => {

                activeOfferFilter = "all";

                filterButtons.forEach(button => {
                    button.classList.toggle(
                        "active",
                        button.dataset.offerFilter === "all"
                    );
                });

                filterOffers();

                showToast("All offers are now displayed.");
            });
        }

        filterOffers();
    }


    /* =====================================================
       16. BOOKING FORM — ELEMENTS
    ===================================================== */

    const bookingForm = $("#booking-form");
    const bookingSuccess = $("#booking-success");

    if (bookingForm) {

        const bookingFormSection =
            $("#booking-form-section");

        const destination = $("#booking-destination");
        const hotel = $("#booking-hotel");

        const checkIn = $("#check-in");
        const checkOut = $("#check-out");

        const adults = $("#booking-adults");
        const children = $("#booking-children");
        const rooms = $("#booking-rooms");

        const roomType = $("#booking-room-type");
        const offer = $("#booking-offer");

        const firstName = $("#booking-firstname");
        const lastName = $("#booking-lastname");

        const email = $("#booking-email");
        const phone = $("#booking-phone");
        const country = $("#booking-country");

        const requests = $("#booking-requests");
        const terms = $("#booking-terms");

        const submitButton = $("#booking-submit-btn");


        /* =================================================
           17. BOOKING DATE RESTRICTIONS
        ================================================= */

        const today = localDateString();

        if (checkIn) {
            checkIn.min = today;
        }

        if (checkOut) {
            checkOut.min = today;
        }

        function updateCheckoutMinimum() {

            if (!checkIn || !checkOut) return;

            if (!checkIn.value) {
                checkOut.min = today;
                return;
            }

            const selectedDate = new Date(
                `${checkIn.value}T00:00:00`
            );

            selectedDate.setDate(selectedDate.getDate() + 1);

            const year = selectedDate.getFullYear();
            const month = String(
                selectedDate.getMonth() + 1
            ).padStart(2, "0");

            const day = String(
                selectedDate.getDate()
            ).padStart(2, "0");

            const nextDay = `${year}-${month}-${day}`;

            checkOut.min = nextDay;

            if (
                checkOut.value &&
                checkOut.value <= checkIn.value
            ) {
                checkOut.value = "";
            }
        }

        checkIn?.addEventListener(
            "change",
            updateCheckoutMinimum
        );


        /* =================================================
           18. BOOKING URL AUTO-FILL
        ================================================= */

        const params = new URLSearchParams(
            window.location.search
        );

        function setSelectValue(element, value) {

            if (!element || !value) return false;

            const normalizedValue =
                String(value).trim().toLowerCase();

            const matchingOption =
                Array.from(element.options).find(option => {

                    return (
                        option.value.trim().toLowerCase() ===
                        normalizedValue
                    ) || (
                        option.textContent.trim().toLowerCase() ===
                        normalizedValue
                    );
                });

            if (!matchingOption) return false;

            element.value = matchingOption.value;

            return true;
        }

        function setInputValue(element, value) {

            if (!element || value === null || value === "") {
                return;
            }

            element.value = value;
        }

        setSelectValue(destination, params.get("destination"));
        setSelectValue(hotel, params.get("hotel"));

        setInputValue(checkIn, params.get("checkIn"));
        setInputValue(checkOut, params.get("checkOut"));

        setInputValue(adults, params.get("adults"));
        setInputValue(children, params.get("children"));
        setInputValue(rooms, params.get("rooms"));

        setSelectValue(roomType, params.get("roomName"));

        if (
            !setSelectValue(roomType, params.get("roomName"))
        ) {
            setSelectValue(roomType, params.get("room"));
        }

        setSelectValue(offer, params.get("offer"));

        updateCheckoutMinimum();


        /* =================================================
           19. BOOKING LIVE SUMMARY
        ================================================= */

        const summaryDestination = $("#summary-destination");
        const summaryHotel = $("#summary-hotel");

        const summaryCheckIn = $("#summary-checkin");
        const summaryCheckOut = $("#summary-checkout");

        const summaryGuests = $("#summary-guests");
        const summaryRoom = $("#summary-room");
        const summaryOffer = $("#summary-offer");

        function updateBookingSummary() {

            if (summaryDestination) {
                summaryDestination.textContent =
                    safeText(destination?.selectedOptions?.[0]?.textContent);
            }

            if (summaryHotel) {
                summaryHotel.textContent =
                    safeText(hotel?.selectedOptions?.[0]?.textContent);
            }

            if (summaryCheckIn) {
                summaryCheckIn.textContent =
                    checkIn?.value
                        ? formatDate(checkIn.value)
                        : "Not selected";
            }

            if (summaryCheckOut) {
                summaryCheckOut.textContent =
                    checkOut?.value
                        ? formatDate(checkOut.value)
                        : "Not selected";
            }

            if (summaryGuests) {

                const adultCount =
                    Number(adults?.value || 0);

                const childCount =
                    Number(children?.value || 0);

                const roomCount =
                    Number(rooms?.value || 0);

                summaryGuests.textContent =
                    `${adultCount} Adults, ${childCount} Children, ${roomCount} Rooms`;
            }

            if (summaryRoom) {
                summaryRoom.textContent =
                    safeText(roomType?.selectedOptions?.[0]?.textContent);
            }

            if (summaryOffer) {
                summaryOffer.textContent =
                    safeText(offer?.selectedOptions?.[0]?.textContent);
            }
        }

        [
            destination,
            hotel,
            checkIn,
            checkOut,
            adults,
            children,
            rooms,
            roomType,
            offer
        ].forEach(element => {

            element?.addEventListener(
                "input",
                updateBookingSummary
            );

            element?.addEventListener(
                "change",
                updateBookingSummary
            );
        });

        updateBookingSummary();


        /* =================================================
           20. BOOKING FORM VALIDATION
        ================================================= */

        function validateBookingForm() {

            const requiredFields = [
                destination,
                hotel,
                checkIn,
                checkOut,
                adults,
                rooms,
                roomType,
                firstName,
                lastName,
                email,
                phone,
                country
            ];

            for (const field of requiredFields) {

                if (!field) continue;

                if (!field.value.trim()) {

                    field.focus();

                    showToast(
                        "Please complete all required fields."
                    );

                    return false;
                }

                if (!field.checkValidity()) {

                    field.reportValidity();

                    return false;
                }
            }

            if (
                checkIn &&
                checkOut &&
                checkOut.value <= checkIn.value
            ) {

                checkOut.focus();

                showToast(
                    "Check-out date must be after check-in date."
                );

                return false;
            }

            if (
                checkIn &&
                checkIn.value < today
            ) {

                checkIn.focus();

                showToast(
                    "Please select a valid future check-in date."
                );

                return false;
            }

            if (
                Number(adults?.value || 0) < 1 ||
                Number(rooms?.value || 0) < 1
            ) {

                showToast(
                    "Please select at least one adult and one room."
                );

                return false;
            }

            if (terms && !terms.checked) {

                terms.focus();

                showToast(
                    "Please accept the booking terms to continue."
                );

                return false;
            }

            return true;
        }


        /* =================================================
           21. BOOKING SUCCESS SCREEN
        ================================================= */

        function generateDemoReference() {

            const randomNumber =
                Math.floor(10000 + Math.random() * 90000);

            return `VEL-DEMO-${randomNumber}`;
        }

        function displayBookingSuccess() {

            const reference =
                generateDemoReference();

            const successReference =
                $("#success-reference-number");

            const successGuest =
                $("#success-guest-name");

            const successDestination =
                $("#success-destination");

            const successHotel =
                $("#success-hotel");

            const successCheckIn =
                $("#success-checkin");

            const successCheckOut =
                $("#success-checkout");

            if (successReference) {
                successReference.textContent = reference;
            }

            if (successGuest) {
                successGuest.textContent =
                    `${firstName?.value || ""} ${lastName?.value || ""}`.trim();
            }

            if (successDestination) {
                successDestination.textContent =
                    safeText(destination?.selectedOptions?.[0]?.textContent);
            }

            if (successHotel) {
                successHotel.textContent =
                    safeText(hotel?.selectedOptions?.[0]?.textContent);
            }

            if (successCheckIn) {
                successCheckIn.textContent =
                    formatDate(checkIn?.value);
            }

            if (successCheckOut) {
                successCheckOut.textContent =
                    formatDate(checkOut?.value);
            }

            if (bookingFormSection) {
                bookingFormSection.hidden = true;
            }

            if (bookingSuccess) {
                bookingSuccess.hidden = false;

                bookingSuccess.scrollIntoView({
                    behavior: prefersReducedMotion ? "instant" : "smooth",
                    block: "start"
                });
            }

            showToast(
                "Demo request completed. No real reservation has been made.",
                5000
            );
        }


        /* =================================================
           22. BOOKING FORM SUBMIT
        ================================================= */

        bookingForm.addEventListener("submit", event => {

            event.preventDefault();

            if (!validateBookingForm()) {
                return;
            }

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "PROCESSING REQUEST...";
            }

            // Frontend demonstration only.
            // No backend, payment, or real hotel reservation.

            setTimeout(() => {

                displayBookingSuccess();

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "SUBMIT APPOINTMENT REQUEST";
                }

            }, prefersReducedMotion ? 0 : 700);
        });


        /* =================================================
           23. BOOK ANOTHER STAY
        ================================================= */

        const bookAnotherButton = $("#book-another-stay");

        if (bookAnotherButton) {

            bookAnotherButton.addEventListener("click", () => {

                bookingForm.reset();

                if (bookingSuccess) {
                    bookingSuccess.hidden = true;
                }

                if (bookingFormSection) {
                    bookingFormSection.hidden = false;
                }

                if (checkIn) {
                    checkIn.min = localDateString();
                }

                if (checkOut) {
                    checkOut.min = localDateString();
                }

                updateCheckoutMinimum();
                updateBookingSummary();

                bookingFormSection?.scrollIntoView({
                    behavior: prefersReducedMotion ? "instant" : "smooth",
                    block: "start"
                });

                showToast(
                    "You can now enter another stay request."
                );
            });
        }
    }


    /* =====================================================
       24. NEWSLETTER DEMO FORM
    ===================================================== */

    $$(".newsletter-form").forEach(form => {

        form.addEventListener("submit", event => {

            event.preventDefault();

            const emailInput =
                $('input[type="email"]', form);

            if (!emailInput) return;

            if (!emailInput.checkValidity()) {

                emailInput.reportValidity();

                return;
            }

            showToast(
                "Thank you for your interest in VELMORA. This is a demo form; your email has not been subscribed.",
                5000
            );

            form.reset();
        });
    });


    /* =====================================================
       25. GENERIC BUTTON FEEDBACK
    ===================================================== */

    $$("[data-toast]").forEach(button => {

        button.addEventListener("click", () => {

            const message =
                button.dataset.toast;

            if (message) {
                showToast(message);
            }
        });
    });


    /* =====================================================
       26. IMAGE LOAD ANIMATION
    ===================================================== */

    $$("img").forEach(img => {

        if (img.complete) {
            img.classList.add("image-loaded");
        } else {

            img.addEventListener("load", () => {
                img.classList.add("image-loaded");
            }, { once: true });

            img.addEventListener("error", () => {
                img.classList.add("image-loaded");
            }, { once: true });
        }
    });


    /* =====================================================
       27. ACCESSIBILITY — ESCAPE KEY
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });


    /* =====================================================
       28. FINAL INITIALIZATION
    ===================================================== */

    document.documentElement.classList.add("js-enabled");

    console.log(
        "%cVELMORA",
        "font-family: Georgia; font-size: 28px; color: #B69A65; letter-spacing: 6px;"
    );

    console.log(
        "Luxury hospitality experience initialized successfully."
    );

});
