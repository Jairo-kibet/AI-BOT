// Sidebar close button logic for sidebar_section.html
// This script assumes the sidebar is in a parent with id 'sidebarPanel' and overlay with id 'sidebarOverlay'
document.addEventListener('DOMContentLoaded', function() {
    var closeBtn = document.getElementById('sidebarCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const centerText = document.getElementById('centerTextTag');
            var sidebarPanel = document.getElementById('sidebarPanel');
            var sidebarOverlay = document.getElementById('sidebarOverlay');
            var mainContainer = document.querySelector('.main-container');
            var topLeftButtons = document.querySelector('.top-left-buttons');
            if (sidebarPanel && sidebarOverlay && mainContainer && topLeftButtons) {
                sidebarPanel.classList.remove('sidebar-visible');
                sidebarOverlay.classList.remove('sidebar-visible');
                topLeftButtons.classList.remove('hide-buttons');
                mainContainer.classList.remove('sidebar-open');
                setTimeout(function() {
                    sidebarPanel.style.display = 'none';
                    sidebarOverlay.style.display = 'none';
                }, 350);
                setTimeout(function() {
                    if(centerText) centerText.style.display = '';
                }, 1);
            }
        });
    }
});
// Sidebar search button expand/collapse logic
(function() {
    var searchBtn = document.getElementById('sidebarSearchBtn');
    var newChatBtn = document.querySelector('.sidebar .new-chat-btn');
    var searchInput = searchBtn ? searchBtn.querySelector('input') : null;
    var conversationList = document.getElementById('conversationList');
    if (searchBtn && newChatBtn && searchInput && conversationList) {
        searchBtn.addEventListener('click', function(e) {
            if (!searchBtn.classList.contains('expanded')) {
                searchBtn.classList.add('expanded');
                newChatBtn.classList.add('shrink-btn');
                setTimeout(function() { searchInput.focus(); }, 350);
                e.stopPropagation();
            }
        });
        // Collapse search on blur or click outside
        document.addEventListener('click', function(e) {
            if (searchBtn.classList.contains('expanded') && !searchBtn.contains(e.target)) {
                searchBtn.classList.remove('expanded');
                newChatBtn.classList.remove('shrink-btn');
            }
        });
        // Optional: collapse on pressing Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchBtn.classList.remove('expanded');
                newChatBtn.classList.remove('shrink-btn');
            }
        });
        // --- SEARCH FUNCTIONALITY ---
        searchInput.addEventListener('input', function() {
            var filter = searchInput.value.trim().toLowerCase();
            var items = conversationList.querySelectorAll('.conversation-item');
            items.forEach(function(item) {
                var text = item.textContent || '';
                if (text.toLowerCase().indexOf(filter) > -1) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
})();
// Starred conversations expand/collapse logic
(function() {
    var starredSection = document.getElementById('starredSection');
    var starredHeader = starredSection ? starredSection.querySelector('.starred-header') : null;
    if (starredSection && starredHeader) {
        starredHeader.addEventListener('click', function(e) {
            starredSection.classList.toggle('expanded');
            e.stopPropagation();
        });
        // Optional: collapse if click outside
        document.addEventListener('click', function(e) {
            if (starredSection.classList.contains('expanded') && !starredSection.contains(e.target)) {
                starredSection.classList.remove('expanded');
            }
        });
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarPanel = document.getElementById('sidebarPanel');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const topLeftButtons = document.querySelector('.top-left-buttons');
    const mainContainer = document.querySelector('.main-container');
    const centerText = document.getElementById('centerTextTag');
    const chatInput = document.querySelector('.chat-input');
    const cardsWrapper = document.querySelector('.cards-wrapper');

    function fixChatInputAndCardsWrapper() {
        if (window.innerWidth < 992) {
            if (sidebarPanel) {
                sidebarPanel.style.display = 'none';
                sidebarPanel.classList.remove('sidebar-visible', 'open');
            }
            if (sidebarOverlay) {
                sidebarOverlay.style.display = 'none';
                sidebarOverlay.classList.remove('sidebar-visible', 'open');
            }
            if (mainContainer) mainContainer.classList.remove('sidebar-open');
            if (topLeftButtons) topLeftButtons.classList.remove('hide-buttons');
            if (centerText) centerText.style.display = '';
            // Prevent sliding for chat-input and cards-wrapper
            if (chatInput) {
                chatInput.style.transform = 'translateX(-50%)';
                chatInput.style.left = '50%';
            }
            if (cardsWrapper) cardsWrapper.style.transform = 'none';
        } else {
            // Reset chat-input style for desktop
            if (chatInput) {
                chatInput.style.transform = '';
                chatInput.style.left = '';
            }
            if (cardsWrapper) cardsWrapper.style.transform = '';
        }
    }

    // Initial fix on load
    fixChatInputAndCardsWrapper();
    // Also fix on resize
    window.addEventListener('resize', fixChatInputAndCardsWrapper);

    function openSidebar() {
        if (!sidebarPanel || !sidebarOverlay || !topLeftButtons || !mainContainer) return;
        // Only allow opening if not on small screen, or if user explicitly toggles
        sidebarPanel.style.display = 'block';
        sidebarOverlay.style.display = 'block';
        setTimeout(() => {
            sidebarPanel.classList.add('sidebar-visible');
            sidebarOverlay.classList.add('sidebar-visible');
            // Only add sidebar-open if not on small screen
            if(window.innerWidth >= 992) {
                topLeftButtons.classList.add('hide-buttons');
                mainContainer.classList.add('sidebar-open');
                if(centerText) centerText.style.display = 'none';
            }
        }, 10);
    }
    function closeSidebar() {
        if (!sidebarPanel || !sidebarOverlay || !topLeftButtons || !mainContainer) return;
        sidebarPanel.classList.remove('sidebar-visible');
        sidebarOverlay.classList.remove('sidebar-visible');
        topLeftButtons.classList.remove('hide-buttons');
        mainContainer.classList.remove('sidebar-open');
        setTimeout(() => {
            sidebarPanel.style.display = 'none';
            sidebarOverlay.style.display = 'none';
            if(centerText) centerText.style.display = '';
            // Prevent sliding for chat-input and cards-wrapper
            if (window.innerWidth < 992) {
                if (chatInput) {
                    chatInput.style.transform = 'translateX(-50%)';
                    chatInput.style.left = '50%';
                }
                if (cardsWrapper) cardsWrapper.style.transform = 'none';
            }
        }, 350);
    }
    if (sidebarToggle && sidebarPanel && sidebarOverlay) {
        sidebarToggle.addEventListener('click', openSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
});
