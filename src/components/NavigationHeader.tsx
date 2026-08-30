'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentHeader from './student/StudentHeader';
import AdminHeader from './admin/AdminHeader';

export default function NavigationHeader() {
  const { user, isAuthenticated } = useAuth();

  // Hide navigation header completely on login/signup page or unapproved student status
  if (!isAuthenticated || !user || (user.userType === 'student' && user.isApproved !== 'yes')) {
    return null;
  }

  if (user.userType === 'student') {
    return <StudentHeader />;
  }

  return <AdminHeader />;
}

