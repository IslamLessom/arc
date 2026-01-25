package handlers

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/pkg/storage"
)

type UploadHandler struct {
	storage *storage.MinIOClient
	logger  *zap.Logger
}

func NewUploadHandler(storageClient *storage.MinIOClient, logger *zap.Logger) *UploadHandler {
	return &UploadHandler{
		storage: storageClient,
		logger:  logger,
	}
}

// UploadImage загружает изображение в MinIO
// @Summary Загрузить изображение
// @Description Загружает изображение в хранилище и возвращает публичный URL
// @Tags upload
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Файл изображения"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /upload/image [post]
// @Security Bearer
func (h *UploadHandler) UploadImage(c *gin.Context) {
	// Получаем файл из формы
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	// Проверяем тип файла
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	allowed := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			allowed = true
			break
		}
	}

	if !allowed {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("file type not allowed. Allowed types: %v", allowedExts),
		})
		return
	}

	// Проверяем размер файла (максимум 10MB)
	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file size exceeds 10MB limit"})
		return
	}

	// Открываем файл
	src, err := file.Open()
	if err != nil {
		h.logger.Error("Failed to open uploaded file", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
		return
	}
	defer src.Close()

	// Определяем Content-Type
	contentType := "image/jpeg"
	switch ext {
	case ".png":
		contentType = "image/png"
	case ".gif":
		contentType = "image/gif"
	case ".webp":
		contentType = "image/webp"
	}

	// Загружаем в MinIO
	url, err := h.storage.UploadImage(c.Request.Context(), src, file.Filename, contentType)
	if err != nil {
		h.logger.Error("Failed to upload image", 
			zap.Error(err),
			zap.String("filename", file.Filename),
			zap.String("content_type", contentType),
			zap.Int64("size", file.Size))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      url,
		"filename": file.Filename,
		"size":     file.Size,
	})
}

// UploadImageFromBase64 загружает изображение из base64 строки
// @Summary Загрузить изображение из base64
// @Description Загружает изображение из base64 строки в хранилище
// @Tags upload
// @Accept json
// @Produce json
// @Param request body map[string]string true "Base64 изображения" SchemaExample({"data": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."})
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /upload/image/base64 [post]
// @Security Bearer
func (h *UploadHandler) UploadImageFromBase64(c *gin.Context) {
	var req struct {
		Data string `json:"data" binding:"required"` // data:image/jpeg;base64,/9j/4AAQSkZJRg...
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Парсим data URL
	parts := strings.Split(req.Data, ",")
	if len(parts) != 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64 data format"})
		return
	}

	header := parts[0] // data:image/jpeg;base64
	data := parts[1]  // base64 encoded data

	// Извлекаем тип из header
	contentType := "image/jpeg"
	if strings.Contains(header, "image/png") {
		contentType = "image/png"
	} else if strings.Contains(header, "image/gif") {
		contentType = "image/gif"
	} else if strings.Contains(header, "image/webp") {
		contentType = "image/webp"
	}

	// Декодируем base64
	decoded, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to decode base64"})
		return
	}

	// Определяем расширение файла
	ext := ".jpg"
	switch contentType {
	case "image/png":
		ext = ".png"
	case "image/gif":
		ext = ".gif"
	case "image/webp":
		ext = ".webp"
	}

	// Загружаем в MinIO (decoded уже []byte, преобразуем в Reader)
	url, err := h.storage.UploadImage(c.Request.Context(), bytes.NewReader(decoded), "image"+ext, contentType)
	if err != nil {
		h.logger.Error("Failed to upload image from base64", 
			zap.Error(err),
			zap.String("content_type", contentType),
			zap.Int("size", len(decoded)))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload image"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url": url,
	})
}
