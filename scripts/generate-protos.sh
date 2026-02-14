#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROTO_DIR="$PROJECT_DIR/protos"
OUT_DIR="$PROJECT_DIR/src/generated"

# Clean previous output
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Find the ts-proto plugin
PROTOC_GEN_TS_PROTO="$PROJECT_DIR/node_modules/.bin/protoc-gen-ts_proto"
if [[ ! -f "$PROTOC_GEN_TS_PROTO" ]] && [[ ! -f "${PROTOC_GEN_TS_PROTO}.cmd" ]]; then
  echo "Error: ts-proto plugin not found. Run 'npm install' first."
  exit 1
fi

# On Windows (Git Bash / MSYS), use the .cmd wrapper
if [[ -f "${PROTOC_GEN_TS_PROTO}.cmd" ]]; then
  PROTOC_GEN_TS_PROTO="${PROTOC_GEN_TS_PROTO}.cmd"
fi

# Use protoc from grpc-tools if system protoc is not available
PROTOC="protoc"
GRPC_TOOLS_PROTOC="$PROJECT_DIR/node_modules/grpc-tools/bin/protoc.exe"
if ! command -v protoc &>/dev/null && [[ -f "$GRPC_TOOLS_PROTOC" ]]; then
  PROTOC="$GRPC_TOOLS_PROTOC"
fi

# Include google well-known types from grpc-tools
GOOGLE_PROTO_PATH="$PROJECT_DIR/node_modules/grpc-tools/bin/google"
GOOGLE_INCLUDE=""
if [[ -d "$GOOGLE_PROTO_PATH" ]]; then
  GOOGLE_INCLUDE="--proto_path=$PROJECT_DIR/node_modules/grpc-tools/bin"
fi

# Collect all proto files
PROTO_FILES=$(find "$PROTO_DIR" -name '*.proto' -type f)

echo "Generating TypeScript from proto files..."
echo "Proto dir: $PROTO_DIR"
echo "Output dir: $OUT_DIR"
echo "Using protoc: $PROTOC"

$PROTOC \
  --plugin="protoc-gen-ts_proto=${PROTOC_GEN_TS_PROTO}" \
  --ts_proto_out="$OUT_DIR" \
  --ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=useOptionals=messages \
  --ts_proto_opt=snakeToCamel=true \
  --ts_proto_opt=forceLong=long \
  --ts_proto_opt=env=both \
  --proto_path="$PROTO_DIR" \
  $GOOGLE_INCLUDE \
  $PROTO_FILES

echo "Proto generation complete. Output in $OUT_DIR"
