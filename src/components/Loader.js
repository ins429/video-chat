import React from 'react'
import styled, { css, keyframes } from 'styled-components'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`

const pulse = keyframes`
  from {
    transform: scale3d(1, 1, 1);
  }

  20% {
    transform: scale3d(1.3, 1.3, 1.3);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
`

const TextLoaderContainer = styled.div`
  margin-top: ${({ marginTop = '0px' }) => marginTop};
`

const spaceCss = ({ isSpace }) =>
  isSpace &&
  css`
    width: 3px;
  `

const Char = styled.div`
  display: inline-block;
  text-transform: uppercase;
  animation-name: ${pulse};
  animation-duration: ${({ animationDuration = 5 }) => animationDuration}s;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  animation-delay: ${({ delay = 0 }) => delay}s;

  ${spaceCss};
`

export const TextLoader = ({ text = 'loading', ...props }) => (
  <TextLoaderContainer {...props}>
    {text.split('').map((char, index, ary) => (
      <Char
        key={index}
        delay={index * 0.3}
        animationDuration={ary.length * 0.3 * 2}
        isSpace={char === ' '}
      >
        {char}
      </Char>
    ))}
  </TextLoaderContainer>
)

export const PageLoader = () => (
  <Container>
    <TextLoader marginTop="20px" />
  </Container>
)

export default TextLoader
