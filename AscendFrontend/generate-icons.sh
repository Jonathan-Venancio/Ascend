#!/bin/bash

# Script para gerar ícones PWA a partir do logo.png
# Requer: ImageMagick ou ffmpeg

echo "Gerando ícones PWA a partir de logo.png..."

# Tamanhos necessários para PWA
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    echo "Gerando ícone ${size}x${size}..."
    
    # Usando ImageMagick (se disponível)
    if command -v convert &> /dev/null; then
        convert public/logo.png -resize ${size}x${size} public/icons/icon-${size}x${size}.png
    # Usando ffmpeg (se disponível)
    elif command -v ffmpeg &> /dev/null; then
        ffmpeg -i public/logo.png -vf "scale=${size}:${size}" public/icons/icon-${size}x${size}.png -y
    else
        echo "ERRO: Instale ImageMagick ou ffmpeg para gerar ícones automaticamente"
        echo "sudo apt-get install imagemagick"
        exit 1
    fi
done

echo "Ícones gerados com sucesso!"
echo "Agora faça commit e deploy para testar o PWA"
