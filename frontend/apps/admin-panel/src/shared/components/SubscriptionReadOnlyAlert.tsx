import React, { useEffect, useState } from 'react'
import { Alert } from 'antd'
import styled from 'styled-components'
import { useSubscriptionReadOnly } from '@restaurant-pos/api-client'

const Styled = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;

  .subscription-alert {
    border-radius: 0;
    margin: 0;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`

export const SubscriptionReadOnlyAlert: React.FC = () => {
  const { isReadOnly } = useSubscriptionReadOnly()
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    setShowAlert(isReadOnly)
  }, [isReadOnly])

  if (!showAlert) {
    return null
  }

  return (
    <Styled>
      <Alert
        className="subscription-alert"
        message="Режим только для чтения"
        description="Ваша подписка истекла. Вы можете просматривать данные, но не можете создавать или редактировать. Пожалуйста, продлите подписку для полного доступа."
        type="warning"
        closable
        onClose={() => setShowAlert(false)}
        icon={<span>⚠️</span>}
      />
    </Styled>
  )
}
