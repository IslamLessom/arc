import { useEffect } from 'react'
import { useAddProductModal } from '../hooks/useAddProductModal'
import type { AddProductModalProps } from '../model/types'
import * as Styled from './styled'
import { ALERT_TEXT } from '../lib/constants'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HelpLinks } from './components/HelpLinks'
import { ProductForm } from './components/ProductForm'

export const AddProductModal = (props: AddProductModalProps) => {
  const {
    formData,
    totalPrice,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    categories,
    workshops,
    warehouses,
    handleFieldChange,
    handleSubmit,
    handleClose,
    modalRef,
    firstFocusableRef,
    handleTabKey,
    handleEscape,
  } = useAddProductModal(props)

  // Focus trap implementation
  useEffect(() => {
    if (!props.isOpen) return

    document.addEventListener('keydown', handleTabKey)
    document.addEventListener('keydown', handleEscape)

    // Focus on first input when modal opens
    setTimeout(() => {
      firstFocusableRef.current?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [props.isOpen, isSubmitting, handleClose, handleTabKey, handleEscape, firstFocusableRef])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (props.isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [props.isOpen])

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose} aria-hidden={!props.isOpen}>
      <Styled.ModalContainer
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Header productId={props.productId} onClose={handleClose} />

        <Styled.ModalBody>
          {error && (
            <Styled.ErrorAlert message={ALERT_TEXT.ERROR} description={error} type="error" closable />
          )}

          <Styled.Form onSubmit={handleSubmit}>
            <Styled.FormContainer>
              <Styled.FormContent>
                <ProductForm
                  formData={formData}
                  fieldErrors={fieldErrors}
                  isSubmitting={isSubmitting}
                  categories={categories}
                  workshops={workshops}
                  warehouses={warehouses}
                  handleFieldChange={handleFieldChange}
                  firstFocusableRef={firstFocusableRef}
                />
              </Styled.FormContent>

              <HelpLinks />
            </Styled.FormContainer>
          </Styled.Form>
        </Styled.ModalBody>

        <Footer
          isFormValid={isFormValid}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          productId={props.productId}
        />
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
