package storage

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"go.uber.org/zap"

	"github.com/yourusername/arc/backend/internal/config"
)

type MinIOClient struct {
	client   *minio.Client
	bucket   string
	publicURL string
	logger   *zap.Logger
}

func NewMinIO(cfg config.StorageConfig, logger *zap.Logger) (*MinIOClient, error) {
	// Initialize minio client
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	// Ensure bucket exists
	ctx := context.Background()
	exists, err := client.BucketExists(ctx, cfg.BucketName)
	if err != nil {
		return nil, fmt.Errorf("failed to check bucket existence: %w", err)
	}

	if !exists {
		err = client.MakeBucket(ctx, cfg.BucketName, minio.MakeBucketOptions{})
		if err != nil {
			return nil, fmt.Errorf("failed to create bucket: %w", err)
		}
		if logger != nil {
			logger.Info("Created MinIO bucket", zap.String("bucket", cfg.BucketName))
		}
	}

	// Set bucket policy for public read access
	policy := `{
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": {"AWS": ["*"]},
				"Action": ["s3:GetObject"],
				"Resource": ["arn:aws:s3:::` + cfg.BucketName + `/*"]
			}
		]
	}`
	
	err = client.SetBucketPolicy(ctx, cfg.BucketName, policy)
	if err != nil {
		// Не критично, если не удалось установить политику
		// Логируем, но продолжаем работу
		if logger != nil {
			logger.Warn("Failed to set bucket policy", 
				zap.Error(err),
				zap.String("bucket", cfg.BucketName))
		}
	} else if logger != nil {
		logger.Info("Set bucket policy for public read access", zap.String("bucket", cfg.BucketName))
	}

	// Проверяем подключение, пытаясь получить информацию о bucket
	_, err = client.GetBucketLocation(ctx, cfg.BucketName)
	if err != nil {
		return nil, fmt.Errorf("failed to verify MinIO connection: %w", err)
	}

	if logger != nil {
		logger.Info("MinIO client initialized successfully",
			zap.String("endpoint", cfg.Endpoint),
			zap.String("bucket", cfg.BucketName),
			zap.String("public_url", cfg.PublicURL))
	}

	return &MinIOClient{
		client:    client,
		bucket:    cfg.BucketName,
		publicURL: cfg.PublicURL,
		logger:    logger,
	}, nil
}

// UploadImage загружает изображение в MinIO и возвращает публичный URL
func (m *MinIOClient) UploadImage(ctx context.Context, file io.Reader, filename string, contentType string) (string, error) {
	// Генерируем уникальное имя файла
	ext := filepath.Ext(filename)
	objectName := fmt.Sprintf("images/%s%s", uuid.New().String(), ext)

	// Загружаем файл
	// Используем -1 для автоматического определения размера
	info, err := m.client.PutObject(ctx, m.bucket, objectName, file, -1, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		if m.logger != nil {
			m.logger.Error("Failed to upload image to MinIO",
				zap.Error(err),
				zap.String("object_name", objectName),
				zap.String("content_type", contentType))
		}
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	// Возвращаем публичный URL
	// Формат: http://localhost:9000/arc-images/images/uuid.jpg
	url := fmt.Sprintf("%s/%s/%s", m.publicURL, m.bucket, objectName)
	
	if m.logger != nil {
		m.logger.Info("Image uploaded successfully",
			zap.String("object_name", objectName),
			zap.String("url", url),
			zap.Int64("size", info.Size))
	}
	
	return url, nil
}

// DeleteImage удаляет изображение из MinIO
func (m *MinIOClient) DeleteImage(ctx context.Context, objectName string) error {
	err := m.client.RemoveObject(ctx, m.bucket, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

// GetPresignedURL возвращает временную ссылку для доступа к файлу
func (m *MinIOClient) GetPresignedURL(ctx context.Context, objectName string, expiry time.Duration) (string, error) {
	url, err := m.client.PresignedGetObject(ctx, m.bucket, objectName, expiry, nil)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}
	return url.String(), nil
}
