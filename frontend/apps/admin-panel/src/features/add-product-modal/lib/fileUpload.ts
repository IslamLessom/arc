export const handleImageUpload = (file: File | undefined, onImageSelected: (file: File) => void): void => {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    console.error('Only image files are allowed')
    return
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    console.error('File size exceeds 5MB limit')
    return
  }

  onImageSelected(file)
}
