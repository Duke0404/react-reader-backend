#!/bin/sh

# Exit on any error
set -e

# Base directory for downloads (mounted from the host)
DATA_DIR=${DATA_DIR:-"/data"}

# Hardcoded URLs for Argos Translate models
declare -A MODEL_URLS=(
    ["en_pl"]="https://example.com/path/to/en_pl.argosmodel"
    ["pl_en"]="https://example.com/path/to/pl_en.argosmodel"
    ["en_de"]="https://example.com/path/to/en_de.argosmodel"
    ["de_en"]="https://example.com/path/to/de_en.argosmodel"
    ["en_fr"]="https://example.com/path/to/en_fr.argosmodel"
    ["fr_en"]="https://example.com/path/to/fr_en.argosmodel"
    ["en_es"]="https://example.com/path/to/en_es.argosmodel"
    ["es_en"]="https://example.com/path/to/es_en.argosmodel"
    ["en_it"]="https://example.com/path/to/en_it.argosmodel"
    ["it_en"]="https://example.com/path/to/it_en.argosmodel"
    ["en_pt"]="https://example.com/path/to/en_pt.argosmodel"
    ["pt_en"]="https://example.com/path/to/pt_en.argosmodel"
    ["en_nl"]="https://example.com/path/to/en_nl.argosmodel"
    ["nl_en"]="https://example.com/path/to/nl_en.argosmodel"
)

# Download Argos Translate models
if [ ! -f $DATA_DIR/libretranslate/DOWNLOAD_COMPLETE ]; then
  echo "📥 Downloading Argos Translate models..."
  mkdir -p $DATA_DIR/libretranslate/models

  for lang_pair in "${!MODEL_URLS[@]}"; do
    echo "📦 Downloading $lang_pair from ${MODEL_URLS[$lang_pair]}..."
    wget -O "$DATA_DIR/libretranslate/models/$lang_pair.argosmodel" "${MODEL_URLS[$lang_pair]}"
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