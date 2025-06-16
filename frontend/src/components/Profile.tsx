import React, { useState, useEffect } from 'react';
import { FaRegUserCircle, FaEye, FaEyeSlash, FaLock, FaExclamationTriangle, FaEdit, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

// API Base URL - sesuaikan dengan AuthForm
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
    const [user, setUser] = useState<any>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockTimer, setBlockTimer] = useState(0);
    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        general: ''
    });
    const [profileErrors, setProfileErrors] = useState({
        username: '',
        email: '',
        general: ''
    });
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    // Rate limiting effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isBlocked && blockTimer > 0) {
            timer = setTimeout(() => {
                setBlockTimer(blockTimer - 1);
            }, 1000);
        } else if (isBlocked && blockTimer === 0) {
            setIsBlocked(false);
            setAttemptCount(0);
        }
        return () => clearTimeout(timer);
    }, [isBlocked, blockTimer]);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (!token || !userData) {
            navigate("/AuthForm?mode=signin");
            return;
        }

        const parsedUser = JSON.parse(userData);
        console.log("Current user data:", parsedUser);
        setUser(parsedUser);
        setFormData({
            username: parsedUser.username || parsedUser.email.split('@')[0] || 'User',
            email: parsedUser.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    }, [navigate]);

    // Verify current password dengan backend API
    const verifyCurrentPassword = async (password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE_URL}api/profile/verify-password`, {
                password
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data.isValid;
            
        } catch (error: any) {
            console.error('Password verification failed:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/AuthForm?mode=signin");
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Update password dengan backend API
    const updatePassword = async (newPassword: string): Promise<boolean> => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${API_BASE_URL}api/profile/update-password`, {
                newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data.success;
        } catch (error: any) {
            console.error('Password update failed:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/AuthForm?mode=signin");
            }
            return false;
        }
    };

    // Update profile data dengan backend API
    const updateProfile = async (userData: { username: string; email: string }): Promise<boolean> => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${API_BASE_URL}api/profile/update-profile`, userData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data.success;
        } catch (error: any) {
            console.error('Profile update failed:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/AuthForm?mode=signin");
            }
            return false;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific errors when user starts typing
        if (name === 'currentPassword' || name === 'newPassword' || name === 'confirmPassword') {
            setPasswordErrors(prev => ({
                ...prev,
                [name]: '',
                general: ''
            }));
        } else if (name === 'username' || name === 'email') {
            setProfileErrors(prev => ({
                ...prev,
                [name]: '',
                general: ''
            }));
        }
    };

    // Strong password validation
    const validatePasswordStrength = (password: string): string => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return 'Password must contain at least one special character';
        }
        return '';
    };

    const validatePasswords = () => {
        const errors = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            general: ''
        };
        let isValid = true;

        // Validate current password
        if (!formData.currentPassword) {
            errors.currentPassword = 'Current password is required';
            isValid = false;
        }

        // Validate new password strength
        if (!formData.newPassword) {
            errors.newPassword = 'New password is required';
            isValid = false;
        } else {
            const strengthError = validatePasswordStrength(formData.newPassword);
            if (strengthError) {
                errors.newPassword = strengthError;
                isValid = false;
            } else if (formData.newPassword === formData.currentPassword) {
                errors.newPassword = 'New password must be different from current password';
                isValid = false;
            }
        }

        // Validate confirm password
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
            isValid = false;
        } else if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setPasswordErrors(errors);
        return isValid;
    };

    const validateProfile = () => {
        const errors = {
            username: '',
            email: '',
            general: ''
        };
        let isValid = true;

        // Validate username
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
            isValid = false;
        }

        // Validate email
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        setProfileErrors(errors);
        return isValid;
    };

    // Handle profile update (username/email only)
    const handleProfileUpdate = async () => {
        if (!validateProfile()) {
            return;
        }

        setIsLoading(true);

        try {
            // Update profile data dengan backend
            const profileUpdateSuccess = await updateProfile({
                username: formData.username,
                email: formData.email
            });

            if (!profileUpdateSuccess) {
                setProfileErrors(prev => ({
                    ...prev,
                    general: 'Failed to update profile. Please try again.'
                }));
                return;
            }

            // Update local user data
            const updatedUser = { 
                ...user, 
                username: formData.username, 
                email: formData.email 
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            // Clear any profile errors
            setProfileErrors({
                username: '',
                email: '',
                general: ''
            });
            
            // Trigger a custom event to notify navbar of user data change
            window.dispatchEvent(new CustomEvent('userDataUpdated', { 
                detail: updatedUser 
            }));

            // Show success message
            alert('Profile updated successfully!');
            setIsEditingProfile(false);
            
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setProfileErrors(prev => ({
                ...prev,
                general: 'An error occurred while updating your profile. Please try again.'
            }));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle password update
    const handlePasswordUpdate = async () => {
        // Check if blocked due to rate limiting
        if (isBlocked) {
            setPasswordErrors(prev => ({
                ...prev,
                general: `Too many failed attempts. Please wait ${blockTimer} seconds.`
            }));
            return;
        }

        // Validate passwords before saving
        if (!validatePasswords()) {
            return;
        }

        setIsLoading(true);

        try {
            // Verify current password dengan backend
            const isCurrentPasswordValid = await verifyCurrentPassword(formData.currentPassword);
            
            if (!isCurrentPasswordValid) {
                const newAttemptCount = attemptCount + 1;
                setAttemptCount(newAttemptCount);
                
                // Implement rate limiting after 3 failed attempts
                if (newAttemptCount >= 3) {
                    setIsBlocked(true);
                    setBlockTimer(30); // 30 seconds block
                    setPasswordErrors(prev => ({
                        ...prev,
                        general: 'Too many failed attempts. Account blocked for 30 seconds.'
                    }));
                } else {
                    setPasswordErrors(prev => ({
                        ...prev,
                        currentPassword: `Incorrect current password. ${3 - newAttemptCount} attempts remaining.`
                    }));
                }
                return;
            }

            // Reset attempt count on successful verification
            setAttemptCount(0);

            // Update password dengan backend
            const passwordUpdateSuccess = await updatePassword(formData.newPassword);
            
            if (!passwordUpdateSuccess) {
                setPasswordErrors(prev => ({
                    ...prev,
                    general: 'Failed to update password. Please try again.'
                }));
                return;
            }

            // Clear password fields after saving
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            // Clear any password errors
            setPasswordErrors({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                general: ''
            });

            // Show success message
            alert('Password updated successfully!');
            setIsEditingPassword(false);
            
        } catch (error: any) {
            console.error('Error updating password:', error);
            setPasswordErrors(prev => ({
                ...prev,
                general: 'An error occurred while updating your password. Please try again.'
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (field: string) => {
        switch (field) {
            case 'current':
                setShowCurrentPassword(!showCurrentPassword);
                break;
            case 'new':
                setShowNewPassword(!showNewPassword);
                break;
            case 'confirm':
                setShowConfirmPassword(!showConfirmPassword);
                break;
        }
    };

    const getPasswordStrengthColor = (password: string) => {
        const score = [
            password.length >= 6,
            /[A-Z]/.test(password),
            /[a-z]/.test(password),
            /[0-9]/.test(password),
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        ].filter(Boolean).length;

        if (score <= 2) return 'text-red-500';
        if (score <= 3) return 'text-yellow-500';
        if (score <= 4) return 'text-blue-500';
        return 'text-green-500';
    };

    const getPasswordStrengthText = (password: string) => {
        const score = [
            password.length >= 6,
            /[A-Z]/.test(password),
            /[a-z]/.test(password),
            /[0-9]/.test(password),
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        ].filter(Boolean).length;

        if (score <= 2) return 'Weak';
        if (score <= 3) return 'Fair';
        if (score <= 4) return 'Good';
        return 'Strong';
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return ( 
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        {/* Navbar */}
        <Navbar />

            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mt-24 text-center">
                <div className="flex justify-center mb-4">
                    <span className="text-secondary text-6xl">
                        <FaRegUserCircle />
                    </span>
                </div>
                
                <h2 className="text-xl font-semibold text-secondary mb-2">
                    {formData.username}
                </h2>
                <p className="text-gray-600 mb-6">{formData.email}</p>

                {/* Profile Error Message */}
                {profileErrors.general && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
                        <FaExclamationTriangle className="mr-2" />
                        <span className="text-sm">{profileErrors.general}</span>
                    </div>
                )}

                {/* Password Error Message */}
                {passwordErrors.general && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
                        <FaExclamationTriangle className="mr-2" />
                        <span className="text-sm">{passwordErrors.general}</span>
                    </div>
                )}

                {/* Rate Limiting Warning */}
                {attemptCount > 0 && !isBlocked && (
                    <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md flex items-center">
                        <FaLock className="mr-2" />
                        <span className="text-sm">
                            Warning: {attemptCount}/3 failed attempts. Account will be temporarily blocked after 3 failed attempts.
                        </span>
                    </div>
                )}

                {/* Profile Section */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center justify-center">
                        <FaEdit className="mr-2" />
                        Profile Information
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-left mb-1 font-medium">
                                Username
                            </label>
                            <input 
                                type="text" 
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={!isEditingProfile || isLoading}
                                className={`border ${profileErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 w-full ${
                                    isEditingProfile && !isLoading ? 'bg-white' : 'bg-gray-50'
                                } focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent`}
                            />
                            {profileErrors.username && (
                                <p className="text-red-500 text-sm mt-1 text-left">{profileErrors.username}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 text-left mb-1 font-medium">
                                Email
                            </label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!isEditingProfile || isLoading}
                                className={`border ${profileErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 w-full ${
                                    isEditingProfile && !isLoading ? 'bg-white' : 'bg-gray-50'
                                } focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent`}
                            />
                            {profileErrors.email && (
                                <p className="text-red-500 text-sm mt-1 text-left">{profileErrors.email}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex space-x-3">
                        {!isEditingProfile ? (
                            <button 
                                onClick={() => setIsEditingProfile(true)}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 rounded-lg font-medium bg-secondary hover:bg-secondary/90 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={handleProfileUpdate}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </div>
                                    ) : (
                                        'Save Profile'
                                    )}
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsEditingProfile(false);
                                        setProfileErrors({
                                            username: '',
                                            email: '',
                                            general: ''
                                        });
                                        // Reset form data to original values
                                        setFormData(prev => ({
                                            ...prev,
                                            username: user.username || user.email.split('@')[0] || 'User',
                                            email: user.email || ''
                                        }));
                                    }}
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Password Section */}
                <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center justify-center">
                        <FaKey className="mr-2" />
                        Change Password
                    </h3>
                    
                    {!isEditingPassword ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-left mb-1 font-medium">
                                    Password
                                </label>
                                <input 
                                    type="password"
                                    value="••••••••"
                                    disabled
                                    className="border border-gray-300 rounded-md p-3 w-full bg-gray-50 focus:outline-none"
                                />
                            </div>
                            <button 
                                onClick={() => setIsEditingPassword(true)}
                                disabled={isLoading}
                                className="w-full px-4 py-2 rounded-lg font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Change Password
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-left mb-1 font-medium">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showCurrentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        disabled={isLoading || isBlocked}
                                        className={`border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 w-full pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${isBlocked ? 'opacity-50' : ''}`}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        disabled={isLoading || isBlocked}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                                    >
                                        {showCurrentPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-red-500 text-sm mt-1 text-left">{passwordErrors.currentPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 text-left mb-1 font-medium">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showNewPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        disabled={isLoading || isBlocked}
                                        className={`border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 w-full pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${isBlocked ? 'opacity-50' : ''}`}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        disabled={isLoading || isBlocked}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                                    >
                                        {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </button>
                                </div>
                                {formData.newPassword && (
                                    <div className="mt-1 text-left">
                                        <span className={`text-sm font-medium ${getPasswordStrengthColor(formData.newPassword)}`}>
                                            Strength: {getPasswordStrengthText(formData.newPassword)}
                                        </span>
                                    </div>
                                )}
                                <div className="mt-1 text-left text-xs text-gray-500">
                                    <p>Password must contain:</p>
                                    <ul className="ml-4">
                                        <li className={formData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                                            • At least 6 characters
                                        </li>
                                        <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                            • One uppercase letter
                                        </li>
                                        <li className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                            • One lowercase letter
                                        </li>
                                        <li className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                            • One number
                                        </li>
                                        <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                            • One special character
                                        </li>
                                    </ul>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-red-500 text-sm mt-1 text-left">{passwordErrors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 text-left mb-1 font-medium">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        disabled={isLoading || isBlocked}
                                        className={`border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 w-full pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent ${isBlocked ? 'opacity-50' : ''}`}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        disabled={isLoading || isBlocked}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1 text-left">{passwordErrors.confirmPassword}</p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button 
                                    onClick={handlePasswordUpdate}
                                    disabled={isLoading || isBlocked}
                                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </div>
                                    ) : (
                                        'Update Password'
                                    )}
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsEditingPassword(false);
                                        setShowCurrentPassword(false);
                                        setShowNewPassword(false);
                                        setShowConfirmPassword(false);
                                        setPasswordErrors({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: '',
                                            general: ''
                                        });
                                        // Reset password fields
                                        setFormData(prev => ({
                                            ...prev,
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        }));
                                    }}
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;