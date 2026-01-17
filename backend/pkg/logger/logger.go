package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func New() (*zap.Logger, error) {
	config := zap.NewProductionConfig()
	config.Encoding = "json"
	config.OutputPaths = []string{"stdout", "logs/app.log"}
	config.ErrorOutputPaths = []string{"stderr", "logs/error.log"}
	config.EncoderConfig.TimeKey = "timestamp"
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	config.EncoderConfig.LevelKey = "level"
	config.EncoderConfig.MessageKey = "message"
	config.EncoderConfig.CallerKey = "caller"
	config.EncoderConfig.StacktraceKey = "stacktrace"

	logger, err := config.Build()
	if err != nil {
		return nil, err
	}

	return logger, nil
}