import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f8fafc;
`;

const Spinner = styled.div`
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3182ce;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const LoadingText = styled.p`
  color: #718096;
  font-size: 0.875rem;
`;

const LoadingScreen = ({ message = "Loading inbox..." }) => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>{message}</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingScreen;