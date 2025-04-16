import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getUserDetails, 
  updateUserProfile, 
  addUserAddress, 
  deleteUserAddress,
  updateUserAddress,
  resetAddressSuccess
} from '../slices/userSlice';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlus, FaEdit, FaTrash, FaUserCircle, FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';

function Profile() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const [editAddressIndex, setEditAddressIndex] = useState(-1);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState('professional');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get user state from Redux store
  const { userInfo, userDetails, loading, error, updateSuccess, addressSuccess } = useSelector((state) => state.user);
  
  // This is kept for backward compatibility with existing code that might use it
  // eslint-disable-next-line no-unused-vars
  const [avatarChanged, setAvatarChanged] = useState(false);
  
  // Add this to track initial loading
  const initialLoadRef = useRef(true);
  
  // Add refs to track state without causing re-renders
  const saveTimeoutRef = useRef(null);
  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Add state for password
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  
  // Add page error state
  const [pageError, setPageError] = useState(null);
  
  // Check if user is logged in
  useEffect(() => {
    // Log current auth state
    console.log('Auth state in Profile:', {
      hasUserInfo: !!userInfo,
      hasToken: userInfo?.token ? 'Yes' : 'No',
      localStorageUserInfo: !!localStorage.getItem('userInfo'),
      sessionStorageKeys: Object.keys(sessionStorage).filter(key => key.includes('userInfo'))
    });
    
    // If not logged in, redirect to login
    if (!userInfo || !userInfo.token) {
      console.error('No user info or token found in Profile component');
      toast.error('Please login to view your profile');
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [userInfo, navigate]);
  
  useEffect(() => {
    // Track if this is an actual update rather than initial load
    const isRealUpdate = updateSuccess && !initialLoadRef.current;
    
    // Debug logs
    console.log("Profile component state:", {
      userDetails,
      loading,
      error,
      formData,
      initialLoad: initialLoadRef.current
    });
    
    // If we don't have the user details, fetch them
    if (userInfo && (!userDetails || !userDetails.firstName)) {
      console.log("Fetching user details because missing data");
      try {
        // Use test database for fetching user profile 
        dispatch(getUserDetails({ id: 'profile', useTestDb: true }))
          .unwrap()
          .then(data => {
            console.log("Successfully fetched user details:", data);
            setPageError(null);
          })
          .catch(err => {
            console.error("Error fetching user details:", err);
            setPageError("Failed to load profile data. Please try refreshing the page.");
          });
      } catch (err) {
        console.error("Exception during user details fetch:", err);
        setPageError("An unexpected error occurred. Please try logging in again.");
      }
    } else if (initialLoadRef.current && userDetails) {
      console.log("Populating form with user data:", userDetails);
      // Populate form with existing user data ONLY on the first load
      setFormData({
        firstName: userDetails.firstName || '',
        lastName: userDetails.lastName || '',
        email: userDetails.email || '',
        phone: userDetails.phone || '',
        avatar: userDetails.profileImage || localStorage.getItem('userAvatar') || '',
      });
      console.log('Loaded phone from user details:', userDetails.phone || '[not set]');
      setSelectedAvatar(userDetails.profileImage || localStorage.getItem('userAvatar') || '');
      // Mark initial load complete
      initialLoadRef.current = false;
    }
    
    // Only show success message for profile data updates (not avatar)
    if (isRealUpdate) {
      // Check if this was a profile update (not just avatar)
      const wasProfileUpdate = 
        formData.firstName !== userDetails?.firstName || 
        formData.lastName !== userDetails?.lastName ||
        formData.email !== userDetails?.email ||
        formData.phone !== userDetails?.phone;
      
      if (wasProfileUpdate) {
        toast.success('Profile updated successfully');
      }
      
      // Still update localStorage for avatar without showing toast
      const avatarWasUpdated = formData.avatar !== userDetails?.profileImage;
      if (avatarWasUpdated) {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          userInfo.avatar = formData.avatar;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        } catch (err) {
          console.error('Error updating userInfo in localStorage:', err);
        }
      }
    }

    if (addressSuccess) {
      toast.success('Address updated successfully');
      // Reset the address form
      setAddressData({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      });
      setShowAddressForm(false);
      setEditAddressIndex(-1);
      dispatch(resetAddressSuccess());
    }
  }, [dispatch, userInfo, userDetails, updateSuccess, addressSuccess, formData]);
  
  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      console.error("Profile error received:", error);
      setPageError(error);
      toast.error(error);
    }
  }, [error]);
  
  // Create a debounced save function for the avatar
  const debouncedSaveAvatar = useCallback((avatarUrl) => {
    // Skip saving if it's the same as the existing avatar
    if (avatarUrl === userDetails?.profileImage) {
      return;
    }
    
    // Clear any pending save operations
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set this ref to track saving state
    isSavingRef.current = true;
    setIsSaving(true);
    
    console.log('Saving avatar:', avatarUrl);
    
    // Create a new user object with updated avatar
    const updatedUser = {
      ...formData,
      avatar: avatarUrl
    };
    
    // Update the user profile
    dispatch(updateUserProfile(updatedUser));
    
    // Cache the avatar in localStorage to ensure it persists
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userInfo.avatar = avatarUrl;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // Also cache in a separate location just for the avatar
      localStorage.setItem('userAvatar', avatarUrl);
    } catch (err) {
      console.error('Error caching avatar:', err);
    }
    
    // After 2 seconds, consider the save complete
    saveTimeoutRef.current = setTimeout(() => {
      isSavingRef.current = false;
      setIsSaving(false);
    }, 2000);
  }, [dispatch, formData, userDetails?.profileImage]);
  
  // Ensure avatar is loaded from cache if needed
  useEffect(() => {
    // If no avatar in memory but cached in localStorage, restore it
    if (!formData.avatar) {
      const cachedAvatar = localStorage.getItem('userAvatar');
      if (cachedAvatar) {
        setFormData(prev => ({...prev, avatar: cachedAvatar}));
        setSelectedAvatar(cachedAvatar);
      }
    }
  }, [formData.avatar]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    console.log('Submitting profile update with phone:', formData.phone);
    
    // Update user profile including avatar
    dispatch(updateUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar,
    }));
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    // Update password
    dispatch(updateUserProfile({
      password: passwordData.newPassword,
      currentPassword: passwordData.currentPassword
    }));
    
    // Clear password fields
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();

    // Validate address fields
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.zip || !addressData.country) {
      toast.error("All address fields are required");
      return;
    }

    if (editAddressIndex >= 0) {
      // Update existing address
      const addressId = userDetails?.addresses[editAddressIndex]?._id;
      if (!addressId) {
        toast.error("Address ID not found");
        return;
      }
      
      dispatch(updateUserAddress({ 
        addressId, 
        addressData 
      }));
    } else {
      // Add new address
      dispatch(addUserAddress(addressData));
    }
  };

  const handleEditAddress = (index) => {
    const address = userDetails?.addresses?.[index];
    if (!address) {
      toast.error("Address information not available");
      return;
    }
    
    setAddressData({
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    });
    setEditAddressIndex(index);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (index) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      dispatch(deleteUserAddress(index));
    }
  };

  const handleCancelAddressEdit = () => {
    setAddressData({
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    });
    setEditAddressIndex(-1);
    setShowAddressForm(false);
  };

  const handleAvatarSelection = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
    setAvatarChanged(true);
    
    // Start saving right away when an avatar is selected, but silently
    if (avatarUrl !== userDetails?.profileImage) {
      debouncedSaveAvatar(avatarUrl);
    }
  };

  const handleSaveAvatar = () => {
    const avatarUrl = customAvatarUrl || selectedAvatar;
    
    if (!avatarUrl) {
      toast.error('Please select an avatar or provide a URL');
      return;
    }
    
    // Update form data with the new avatar
    setFormData(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
    
    // Close the modal
    setShowAvatarModal(false);
    
    // Save the avatar with a visual indicator (but no toast)
    setIsSaving(true);
    
    // Use the debounced save function
    debouncedSaveAvatar(avatarUrl);
  };

  // Add a function to toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Replace the existing predefined avatars array with categorized avatars
  const avatarCategories = [
    {
      id: 'professional',
      name: 'Professional',
      avatars: [
        // Modern professional personas (non-letter based)
        'https://api.dicebear.com/7.x/personas/svg?seed=Executive1&backgroundColor=f5f5f5',
        'https://api.dicebear.com/7.x/personas/svg?seed=Manager1&backgroundColor=f8f9fa',
        'https://api.dicebear.com/7.x/personas/svg?seed=CEO1&backgroundColor=ffffff',
        'https://api.dicebear.com/7.x/personas/svg?seed=Director1&backgroundColor=f0f0f0',
        'https://api.dicebear.com/7.x/personas/svg?seed=Consultant1&backgroundColor=f5f5f5',
        'https://api.dicebear.com/7.x/personas/svg?seed=Professional1&backgroundColor=f8f9fa',
        'https://api.dicebear.com/7.x/personas/svg?seed=Analyst1&backgroundColor=ffffff',
        'https://api.dicebear.com/7.x/personas/svg?seed=Leader1&backgroundColor=f0f0f0',
        'https://api.dicebear.com/7.x/personas/svg?seed=Manager2&backgroundColor=f5f5f5',
        'https://api.dicebear.com/7.x/personas/svg?seed=Executive2&backgroundColor=f8f9fa',
        'https://api.dicebear.com/7.x/personas/svg?seed=CEO2&backgroundColor=ffffff',
        'https://api.dicebear.com/7.x/personas/svg?seed=Director2&backgroundColor=f0f0f0',
        'https://api.dicebear.com/7.x/personas/svg?seed=Consultant2&backgroundColor=f5f5f5',
        'https://api.dicebear.com/7.x/personas/svg?seed=Professional2&backgroundColor=f8f9fa',
        'https://api.dicebear.com/7.x/personas/svg?seed=Analyst2&backgroundColor=ffffff',
        'https://api.dicebear.com/7.x/personas/svg?seed=Leader2&backgroundColor=f0f0f0',
        'https://api.dicebear.com/7.x/personas/svg?seed=Manager3&backgroundColor=f5f5f5',
        'https://api.dicebear.com/7.x/personas/svg?seed=Executive3&backgroundColor=f8f9fa',
        'https://api.dicebear.com/7.x/personas/svg?seed=CEO3&backgroundColor=ffffff',
        'https://api.dicebear.com/7.x/personas/svg?seed=Director3&backgroundColor=f0f0f0',
        'https://api.dicebear.com/7.x/personas/svg?seed=Consultant3&backgroundColor=f5f5f5',
        'https://api.dicebear.com/7.x/personas/svg?seed=Professional3&backgroundColor=f8f9fa',
        'https://api.dicebear.com/7.x/personas/svg?seed=Analyst3&backgroundColor=ffffff',
        'https://api.dicebear.com/7.x/personas/svg?seed=Leader3&backgroundColor=f0f0f0',
        'https://api.dicebear.com/7.x/personas/svg?seed=Manager4&backgroundColor=f5f5f5',
        'https://api.dicebear.com/7.x/personas/svg?seed=Executive4&backgroundColor=f8f9fa',
        'https://api.dicebear.com/7.x/personas/svg?seed=CEO4&backgroundColor=ffffff',
        'https://api.dicebear.com/7.x/personas/svg?seed=Director4&backgroundColor=f0f0f0',
        'https://api.dicebear.com/7.x/personas/svg?seed=Consultant4&backgroundColor=f5f5f5',
        'https://api.dicebear.com/7.x/personas/svg?seed=Professional4&backgroundColor=f8f9fa'
      ]
    },
    {
      id: 'avataaars',
      name: 'Illustrated',
      avatars: [
        // Expanded avataaars with diverse options
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Executive1&hairColor=2c1b18&skinColor=f2d3b1',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager1&hairColor=2c1b18&skinColor=d08b5b',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Director1&hairColor=d6b370&skinColor=edb98a',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO1&hairColor=724133&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Analyst1&hairColor=4a312c&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Consultant1&hairColor=2c1b18&skinColor=614335',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Executive2&hairColor=090806&skinColor=f2d3b1',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager2&hairColor=090806&skinColor=d08b5b',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Director2&hairColor=a55728&skinColor=edb98a',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO2&hairColor=a55728&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Analyst2&hairColor=b58143&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Consultant2&hairColor=b58143&skinColor=614335',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Executive3&hairColor=e8e1e1&skinColor=f2d3b1',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager3&hairColor=e8e1e1&skinColor=d08b5b',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Director3&hairColor=b58143&skinColor=edb98a',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO3&hairColor=b58143&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Analyst3&hairColor=d6b370&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Consultant3&hairColor=d6b370&skinColor=614335',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Executive4&hairColor=b58143&skinColor=f2d3b1',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager4&hairColor=b58143&skinColor=d08b5b',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Director4&hairColor=e8e1e1&skinColor=edb98a',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO4&hairColor=e8e1e1&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Analyst4&hairColor=090806&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Consultant4&hairColor=090806&skinColor=614335',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Executive5&hairColor=4a312c&skinColor=f2d3b1',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager5&hairColor=4a312c&skinColor=d08b5b',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Director5&hairColor=a55728&skinColor=edb98a',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=CEO5&hairColor=a55728&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Analyst5&hairColor=a55728&skinColor=ae5d29',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Consultant5&hairColor=a55728&skinColor=614335'
      ]
    },
    {
      id: 'tech',
      name: 'Tech',
      avatars: [
        // Expanded tech avatars with more variety
        'https://api.dicebear.com/7.x/bottts/svg?seed=Developer1&colors[]=indigo',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Engineer1&colors[]=blue',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Designer1&colors[]=cyan',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Architect1&colors[]=teal',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Analyst1&colors[]=green',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Consultant1&colors[]=yellow',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Developer2&colors[]=orange',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Engineer2&colors[]=red',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Designer2&colors[]=pink',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Architect2&colors[]=purple',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Analyst2&colors[]=brown',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Consultant2&colors[]=gray',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Developer3&colors[]=blue,purple',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Engineer3&colors[]=cyan,blue',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Designer3&colors[]=teal,cyan',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Architect3&colors[]=green,teal',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Analyst3&colors[]=yellow,green',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Consultant3&colors[]=orange,yellow',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Developer4&colors[]=red,orange',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Engineer4&colors[]=pink,red',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Designer4&colors[]=purple,pink',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Architect4&colors[]=indigo,purple',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Analyst4&colors[]=blue,indigo',
        'https://api.dicebear.com/7.x/bottts/svg?seed=Consultant4&colors[]=cyan,blue',
        'https://api.dicebear.com/7.x/bottts/svg?seed=TechLead1&colors[]=teal,green',
        'https://api.dicebear.com/7.x/bottts/svg?seed=TechLead2&colors[]=green,yellow',
        'https://api.dicebear.com/7.x/bottts/svg?seed=TechLead3&colors[]=yellow,orange',
        'https://api.dicebear.com/7.x/bottts/svg?seed=SysAdmin1&colors[]=orange,red',
        'https://api.dicebear.com/7.x/bottts/svg?seed=SysAdmin2&colors[]=red,pink',
        'https://api.dicebear.com/7.x/bottts/svg?seed=SysAdmin3&colors[]=pink,purple'
      ]
    },
    {
      id: 'minimal',
      name: 'Minimal',
      avatars: [
        // Expanded minimal avatars with geometric designs
        'https://api.dicebear.com/7.x/shapes/svg?seed=Professional1&colors[]=0096c7,023e8a',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Professional2&colors[]=0077b6,023047',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Professional3&colors[]=1d3557,0466c8',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Professional4&colors[]=073b4c,0466c8',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Professional5&colors[]=1a535c,3d5a80',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Professional6&colors[]=264653,2a9d8f',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Manager1&colors[]=001219,005f73',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Manager2&colors[]=0a9396,94d2bd',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Manager3&colors[]=ee9b00,ca6702',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Manager4&colors[]=bb3e03,ae2012',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Manager5&colors[]=9b2226,641220',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Director1&colors[]=03071e,370617',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Director2&colors[]=6a040f,9d0208',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Director3&colors[]=d00000,dc2f02',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Director4&colors[]=e85d04,f48c06',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Director5&colors[]=faa307,ffba08',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Analyst1&colors[]=d8f3dc,b7e4c7',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Analyst2&colors[]=95d5b2,74c69d',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Analyst3&colors[]=52b788,40916c',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Analyst4&colors[]=2d6a4f,1b4332',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Analyst5&colors[]=081c15,1b4332',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Executive1&colors[]=f8f9fa,e9ecef',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Executive2&colors[]=dee2e6,ced4da',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Executive3&colors[]=adb5bd,6c757d',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Executive4&colors[]=495057,343a40',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Executive5&colors[]=212529,343a40',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Designer1&colors[]=7400b8,6930c3',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Designer2&colors[]=5e60ce,5390d9',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Designer3&colors[]=4ea8de,48bfe3',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Designer4&colors[]=56cfe1,64dfdf',
        'https://api.dicebear.com/7.x/shapes/svg?seed=Designer5&colors[]=72efdd,80ffdb'
      ]
    },
    {
      id: 'abstract',
      name: 'Abstract',
      avatars: [
        // New category with abstract, artistic avatars
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Creative1&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Creative2&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Creative3&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Creative4&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Creative5&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Artist1&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Artist2&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Artist3&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Artist4&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Artist5&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Designer1&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Designer2&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Designer3&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Designer4&scale=80&radius=50',
        'https://api.dicebear.com/7.x/thumbs/svg?seed=Designer5&scale=80&radius=50',
        'https://api.dicebear.com/7.x/identicon/svg?seed=Profile1&backgroundColor=f8f9fa',
        'https://api.dicebear.com/7.x/identicon/svg?seed=Profile2&backgroundColor=e9ecef',
        'https://api.dicebear.com/7.x/identicon/svg?seed=Profile3&backgroundColor=dee2e6',
        'https://api.dicebear.com/7.x/identicon/svg?seed=Profile4&backgroundColor=ced4da',
        'https://api.dicebear.com/7.x/identicon/svg?seed=Profile5&backgroundColor=adb5bd',
        'https://api.dicebear.com/7.x/identicon/svg?seed=User1&backgroundColor=6c757d',
        'https://api.dicebear.com/7.x/identicon/svg?seed=User2&backgroundColor=495057',
        'https://api.dicebear.com/7.x/identicon/svg?seed=User3&backgroundColor=343a40',
        'https://api.dicebear.com/7.x/identicon/svg?seed=User4&backgroundColor=212529',
        'https://api.dicebear.com/7.x/identicon/svg?seed=User5&backgroundColor=0d1b2a',
        'https://api.dicebear.com/7.x/rings/svg?seed=Abstracta1&primaryColorLevel=700',
        'https://api.dicebear.com/7.x/rings/svg?seed=Abstracta2&primaryColorLevel=700',
        'https://api.dicebear.com/7.x/rings/svg?seed=Abstracta3&primaryColorLevel=700',
        'https://api.dicebear.com/7.x/rings/svg?seed=Abstracta4&primaryColorLevel=700',
        'https://api.dicebear.com/7.x/rings/svg?seed=Abstracta5&primaryColorLevel=700'
      ]
    }
  ];
  
  return (
    <div className="container my-5">
      {/* Profile Title & Navigation */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="fw-bold mb-3">My Profile</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Profile</li>
            </ol>
          </nav>
        </div>
      </div>
      
      {/* Error message */}
      {pageError && (
        <div className="alert alert-danger mb-4">
          <strong>Error:</strong> {pageError}
          <button 
            type="button" 
            className="btn btn-outline-danger ms-3"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {/* Only show profile when not loading and no errors */}
      {!loading && !pageError && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body text-center py-4">
                <div className="text-center mb-4">
                  <div className="position-relative d-inline-block">
                    {formData.avatar ? (
                      <div className="position-relative">
                        <img 
                          src={formData.avatar} 
                          alt={`${formData.firstName} ${formData.lastName}`} 
                          className="rounded-circle shadow-sm"
                          style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                        />
                        {isSaving && (
                          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle" 
                               style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
                            <div className="spinner-border text-light spinner-border-sm" role="status">
                              <span className="visually-hidden">Saving...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <FaUserCircle size={120} className="text-primary" />
                    )}
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="position-absolute bottom-0 end-0 rounded-circle p-1"
                      onClick={() => setShowAvatarModal(true)}
                    >
                      <FaCamera />
                    </Button>
                  </div>
                </div>
                <h5 className="fw-bold mb-1">{formData.firstName} {formData.lastName}</h5>
                <p className="text-muted mb-0">{formData.email}</p>
              </div>
            </div>
            
            <div className="list-group list-group-flush shadow-sm mb-4">
              <a href="#profile-section" className="list-group-item list-group-item-action active">
                <i className="bi bi-person me-2"></i>Profile
              </a>
              <a href="#addresses-section" className="list-group-item list-group-item-action">
                <i className="bi bi-geo-alt me-2"></i>Addresses
              </a>
              <a href="#security-section" className="list-group-item list-group-item-action">
                <i className="bi bi-shield-lock me-2"></i>Security
              </a>
              <Link to="/orders" className="list-group-item list-group-item-action">
                <i className="bi bi-bag me-2"></i>View All Orders
              </Link>
            </div>
          </div>
          
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4" id="profile-section">
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-bold">Profile Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label">First Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label">Last Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="lastName"
                        name="lastName" 
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email"
                        name="email" 
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label">Phone</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        id="phone"
                        name="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="card border-0 shadow-sm mb-4" id="addresses-section">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">My Addresses</h5>
                {!showAddressForm && (
                  <button 
                    onClick={() => {
                      setShowAddressForm(true);
                      setAddressData({
                        street: '',
                        city: '',
                        state: '',
                        zip: '',
                        country: '',
                      });
                      setEditAddressIndex(-1);
                    }} 
                    className="btn btn-outline-primary btn-sm"
                  >
                    <FaPlus className="me-1" /> Add Address
                  </button>
                )}
              </div>
              <div className="card-body">
                {showAddressForm && (
                  <div className="mb-4 border p-3 rounded bg-light">
                    <h6 className="mb-3">{editAddressIndex >= 0 ? 'Edit Address' : 'Add New Address'}</h6>
                    <form onSubmit={handleAddressSubmit}>
                      <div className="mb-3">
                        <label htmlFor="street" className="form-label">Street Address*</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="street"
                          name="street"
                          value={addressData.street}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="city" className="form-label">City*</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="city"
                            name="city"
                            value={addressData.city}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="state" className="form-label">State/Province*</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="state"
                            name="state"
                            value={addressData.state}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="zip" className="form-label">Postal/Zip Code*</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="zip"
                            name="zip"
                            value={addressData.zip}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="country" className="form-label">Country*</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            id="country"
                            name="country"
                            value={addressData.country}
                            onChange={handleAddressChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary me-2"
                          onClick={handleCancelAddressEdit}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : editAddressIndex >= 0 ? 'Update Address' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {!userDetails?.addresses || userDetails?.addresses.length === 0 ? (
                  <div className="alert alert-info">
                    You don't have any saved addresses yet. Add an address to make checkout faster.
                  </div>
                ) : (
                  <div className="row">
                    {userDetails?.addresses.map((address, index) => (
                      <div className="col-md-6 mb-3" key={index}>
                        <div className="card h-100 border">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="fw-bold mb-0">Address {index + 1}</h6>
                              <div>
                                <button 
                                  onClick={() => handleEditAddress(index)}
                                  className="btn btn-sm btn-link text-primary p-0 me-2"
                                >
                                  <FaEdit />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAddress(index)}
                                  className="btn btn-sm btn-link text-danger p-0"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                            <p className="mb-1">{address.street}</p>
                            <p className="mb-1">
                              {address.city}, {address.state} {address.zip}
                            </p>
                            <p className="mb-0">{address.country}</p>
                          </div>
                          <div className="card-footer bg-light">
                            <button 
                              className="btn btn-sm btn-outline-primary w-100"
                              onClick={() => {
                                // Save to localStorage for checkout
                                localStorage.setItem('shippingAddress', JSON.stringify(address));
                                toast.success('Address selected for checkout');
                              }}
                            >
                              Use for Shipping
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="card border-0 shadow-sm" id="security-section">
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-bold">Security</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <div className="input-group">
                      <input 
                        type={passwordVisibility.currentPassword ? "text" : "password"} 
                        className="form-control" 
                        id="currentPassword"
                        name="currentPassword" 
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => togglePasswordVisibility('currentPassword')}
                      >
                        {passwordVisibility.currentPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <div className="input-group">
                      <input 
                        type={passwordVisibility.newPassword ? "text" : "password"} 
                        className="form-control" 
                        id="newPassword"
                        name="newPassword" 
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                      >
                        {passwordVisibility.newPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <div className="form-text">Password must be at least 8 characters long</div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <div className="input-group">
                      <input 
                        type={passwordVisibility.confirmPassword ? "text" : "password"} 
                        className="form-control" 
                        id="confirmPassword"
                        name="confirmPassword" 
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                      >
                        {passwordVisibility.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Choose Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h6 className="fw-bold mb-3">Select Avatar Style</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {avatarCategories.map(category => (
                <Button 
                  key={category.id}
                  variant={selectedCategory === category.id ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-pill"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h6 className="mb-3">Choose an Avatar</h6>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {avatarCategories.find(c => c.id === selectedCategory)?.avatars.map((avatar, index) => (
                <div 
                  key={`${selectedCategory}-${index}`}
                  className={`border rounded p-1 ${selectedAvatar === avatar ? 'border-primary border-2' : ''}`}
                  onClick={() => handleAvatarSelection(avatar)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={avatar} 
                    alt={`Avatar ${index + 1}`} 
                    style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                    className="rounded"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <h6 className="fw-bold mb-2">Or use custom image URL</h6>
            <input 
              type="text" 
              className="form-control" 
              placeholder="https://example.com/your-image.jpg"
              value={customAvatarUrl}
              onChange={(e) => {
                setCustomAvatarUrl(e.target.value);
                if (e.target.value) {
                  setAvatarChanged(true);
                  // Start saving immediately when a valid URL is entered
                  if (e.target.value.startsWith('http')) {
                    debouncedSaveAvatar(e.target.value);
                  }
                }
              }}
            />
            {customAvatarUrl && (
              <div className="mt-2 text-center">
                <p className="mb-1">Preview:</p>
                <img 
                  src={customAvatarUrl} 
                  alt="Custom avatar preview" 
                  className="rounded"
                  style={{ 
                    maxWidth: '100px', 
                    maxHeight: '100px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/100?text=Invalid+URL';
                  }}
                />
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAvatar}>
            Save Profile Picture
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Profile; 