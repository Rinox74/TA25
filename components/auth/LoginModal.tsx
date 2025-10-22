import React from 'react';
import { Modal } from '../ui/Modal';
import { Login } from '../views/Login';
import { useAuth } from '../../contexts/AuthContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal } = useAuth();

  if (!isLoginModalOpen) {
    return null;
  }

  return (
    <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal} title="Accedi al tuo account">
      <Login />
    </Modal>
  );
};
