// Navigation links data
export const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Products' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' }
];

// Generate user action links based on login status
export const getUserActions = (isLoggedIn, cartItemsCount = 0, userRole = null) => {
  if (isLoggedIn) {
    const actions = [
      { 
        path: '/cart', 
        label: 'Cart', 
        icon: 'cart', 
        badge: cartItemsCount.toString(),
        className: 'btn-outline-light'
      },
      { 
        path: '/wishlist', 
        label: 'Wishlist', 
        icon: 'heart',
        className: 'btn-outline-light'
      },
      { 
        path: '/orders', 
        label: 'My Orders', 
        icon: 'bag',
        className: 'btn-outline-light'
      },
      { 
        path: '/profile', 
        label: 'My Account', 
        icon: 'person',
        className: 'btn-primary'
      }
    ];
    
    // Add admin button if user has admin role
    if (userRole === 'admin') {
      actions.push({
        path: '/admin/dashboard',
        label: 'Admin',
        icon: 'gear',
        className: 'btn-info'
      });
    }
    
    return actions;
  } else {
    return [
      { 
        path: '/login', 
        label: 'Login', 
        className: 'btn-primary'
      },
      { 
        path: '/signup', 
        label: 'Sign Up', 
        className: 'btn-success'
      },
      {
        path: '/admin/login',
        label: 'Admin',
        icon: 'shield-lock',
        className: 'btn-secondary'
      }
    ]; 
  }
};

// Legacy support for static userActions (to be removed after updating all components)
export const userActions = [
  { 
    path: '/login', 
    label: 'Login', 
    className: 'btn-primary'
  },
  { 
    path: '/signup', 
    label: 'Sign Up', 
    className: 'btn-success'
  }
]; 