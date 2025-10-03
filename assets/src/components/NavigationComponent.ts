/**
 * Navigation Component
 * Handles responsive navigation and mobile menu functionality
 */

export class NavigationComponent {
  private hamburger: HTMLElement | null = null;
  private mobileMenu: HTMLElement | null = null;
  private closeMenuBtn: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // Get DOM elements
    this.hamburger = document.querySelector('.hamburger');
    this.mobileMenu = document.querySelector('.mobile-menu');
    this.closeMenuBtn = document.querySelector('.close-menu');

    if (!this.hamburger || !this.mobileMenu || !this.closeMenuBtn) {
      console.warn('Navigation elements not found. Navigation component not initialized.');
      return;
    }

    this.bindEvents();
    this.initUserDropdown();
  }

  private bindEvents(): void {
    // Hamburger menu click - open mobile menu
    this.hamburger?.addEventListener('click', () => {
      this.openMobileMenu();
    });

    // Close button click - close mobile menu
    this.closeMenuBtn?.addEventListener('click', () => {
      this.closeMobileMenu();
    });

    // Click outside mobile menu to close
    this.mobileMenu?.addEventListener('click', (e) => {
      if (e.target === this.mobileMenu) {
        this.closeMobileMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu when clicking on navigation links
    const mobileNavLinks = this.mobileMenu?.querySelectorAll('.mobile-nav a');
    mobileNavLinks?.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Handle window resize - close mobile menu on desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 769 && this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    });
  }

  private openMobileMenu(): void {
    if (!this.mobileMenu || !this.hamburger) return;
    
    // Add active classes for animations
    this.mobileMenu.classList.add('active');
    this.hamburger.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Focus on close button for accessibility
    setTimeout(() => {
      this.closeMenuBtn?.focus();
    }, 100);
  }

  private closeMobileMenu(): void {
    if (!this.mobileMenu || !this.hamburger) return;
    
    // Remove active classes
    this.mobileMenu.classList.remove('active');
    this.hamburger.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Return focus to hamburger button
    setTimeout(() => {
      this.hamburger?.focus();
    }, 100);
  }

  private isMobileMenuOpen(): boolean {
    return this.mobileMenu?.classList.contains('active') || false;
  }

  /**
   * Highlight the active navigation link based on current page
   */
  public highlightActiveLink(): void {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a');
    
    navLinks.forEach(link => {
      const linkElement = link as HTMLAnchorElement;
      const href = linkElement.getAttribute('href');
      
      if (href && (currentPath.endsWith(href) || (href === 'index.html' && currentPath === '/'))) {
        linkElement.classList.add('active');
      } else {
        linkElement.classList.remove('active');
      }
    });
  }

  /**
   * Destroy the navigation component and remove event listeners
   */
  public destroy(): void {
    // Close mobile menu if open
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }

    // Remove custom event listeners
    // Note: We don't remove all listeners as they're handled by browser cleanup
    console.log('Navigation component destroyed');
  }

  /**
   * Initialize profile dropdown functionality
   */
  private initUserDropdown(): void {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (!profileBtn || !profileDropdown) return;

    // Toggle dropdown on button click
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = profileBtn.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        this.closeDropdown(profileBtn, profileDropdown);
      } else {
        this.openDropdown(profileBtn, profileDropdown);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target as Node) && !profileDropdown.contains(e.target as Node)) {
        this.closeDropdown(profileBtn, profileDropdown);
      }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && profileDropdown.classList.contains('show')) {
        this.closeDropdown(profileBtn, profileDropdown);
        profileBtn.focus();
      }
    });

    // Handle logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }

    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  /**
   * Open dropdown menu
   */
  private openDropdown(button: HTMLElement, menu: HTMLElement): void {
    button.setAttribute('aria-expanded', 'true');
    menu.classList.add('show');
  }

  /**
   * Close dropdown menu
   */
  private closeDropdown(button: HTMLElement, menu: HTMLElement): void {
    button.setAttribute('aria-expanded', 'false');
    menu.classList.remove('show');
  }

  /**
   * Handle user logout
   */
  private async handleLogout(): Promise<void> {
    try {
      const authModule = await import('../firebase/auth.js');
      const authService = new (authModule as any).AuthService();
      await authService.logout();
      
      // Redirect to home page
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: just redirect
      window.location.href = 'index.html';
    }
  }
}
