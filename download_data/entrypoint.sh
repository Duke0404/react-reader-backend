#!/bin/sh

# Exit on any error
set -e

# Base directory for downloads (mounted from the host)
DATA_DIR=${DATA_DIR:-"/data"}

# Hardcoded URLs for Argos Translate models
declare -A MODEL_URLS=(
    ["en_pl"]="https://argos-net.com/v1/translate-en_pl-1_9.argosmodel"
    ["pl_en"]="https://argos-net.com/v1/translate-pl_en-1_9.argosmodel"
    ["en_de"]="https://argos-net.com/v1/translate-en_de-1_9.argosmodel"
    ["de_en"]="https://argos-net.com/v1/translate-de_en-1_9.argosmodel"
    ["en_fr"]="https://argos-net.com/v1/translate-en_fr-1_9.argosmodel"
    ["fr_en"]="https://argos-net.com/v1/translate-fr_en-1_9.argosmodel"
    ["en_es"]="https://argos-net.com/v1/translate-en_es-1_0.argosmodel"
    ["es_en"]="https://argos-net.com/v1/translate-es_en-1_0.argosmodel"
    ["en_it"]="https://argos-net.com/v1/translate-en_it-1_0.argosmodel"
    ["it_en"]="https://argos-net.com/v1/translate-it_en-1_0.argosmodel"
    ["en_pt"]="https://argos-net.com/v1/translate-en_pt-1_0.argosmodel"
    ["pt_en"]="https://argos-net.com/v1/translate-pt_en-1_0.argosmodel"
    ["en_nl"]="https://argos-net.com/v1/translate-en_nl-1_8.argosmodel"
    ["nl_en"]="https://argos-net.com/v1/translate-nl_en-1_8.argosmodel"
)

# Download Argos Translate models
if [ ! -f $DATA_DIR/libretranslate/DOWNLOAD_COMPLETE ]; then
  echo "📥 Downloading Argos Translate models..."
  mkdir -p $DATA_DIR/libretranslate/models

  for lang_pair in "${!MODEL_URLS[@]}"; do
    echo "📦 Downloading $lang_pair from ${MODEL_URLS[$lang_pair]}..."
    wget -v -O"$DATA_DIR/libretranslate/models/$lang_pair.argosmodel" "${MODEL_URLS[$lang_pair]}"
  done

  echo "✅ Argos models downloaded."
  touch $DATA_DIR/libretranslate/DOWNLOAD_COMPLETE
else
  echo "✅ Argos Translate models already present."
fi

# Piper voice model
if [ ! -f $DATA_DIR/piper/DOWNLOAD_COMPLETE ]; then
  echo "📥 Downloading Piper voice model..."
  mkdir -p $DATA_DIR/piper/models

  wget -O $DATA_DIR/piper/models/en_US-lessac-high.onnx \
    https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/high/en_US-lessac-high.onnx?download=true

  echo "✅ Piper voice model downloaded."
  touch $DATA_DIR/piper/DOWNLOAD_COMPLETE
else
  echo "✅ Piper voice model already present."
fi

echo "🎉 All downloads complete!"