import React, { useContext } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { Redirect } from 'react-router-dom'
import CurrentUserContext from 'components/CurrentUserContext'
import { TextLoader } from 'components/Loader'

const VALIDATE_SIGN_IN = gql`
  query ValidateSignIn($token: String!) {
    validateSignIn(token: $token)
  }
`

const TokenAuth = ({
  match: {
    params: { token }
  }
}) => {
  const { data, loading } = useQuery(VALIDATE_SIGN_IN, {
    variables: {
      token
    }
  })
  const { refetch: refetchCurrentUser } = useContext(CurrentUserContext)

  if (loading) return <TextLoader />

  if (data) {
    refetchCurrentUser()

    return (
      <Redirect
        to={{
          pathname: '/',
          state: { reloadCurrentUser: true }
        }}
      />
    )
  }

  return 'Invalid token.'
}

export default TokenAuth
