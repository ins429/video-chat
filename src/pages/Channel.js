import React from 'react'
import Messenger from 'components/Messenger'
import { useParams } from 'react-router-dom'

const Channel = () => {
  const { channelId } = useParams()

  return (
    <div>
      channel page
      <Messenger channelId={channelId} />
    </div>
  )
}

export default Channel
