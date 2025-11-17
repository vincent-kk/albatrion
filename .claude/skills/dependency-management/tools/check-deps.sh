#!/bin/bash

# Dependency Check Script for @canard/schema-form plugins
# 플러그인 package.json 의존성 검증 스크립트

set -e

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Usage
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <package.json path>"
  echo "Example: $0 ./packages/canard-schema-form-mui-plugin/package.json"
  exit 1
fi

PACKAGE_JSON="$1"

if [ ! -f "$PACKAGE_JSON" ]; then
  echo -e "${RED}Error: package.json not found at $PACKAGE_JSON${NC}"
  exit 1
fi

echo "🔍 Checking dependencies in $PACKAGE_JSON"
echo ""

# Extract package name
PACKAGE_NAME=$(cat "$PACKAGE_JSON" | jq -r '.name')
echo "📦 Package: $PACKAGE_NAME"
echo ""

# Check 1: Verify required fields
echo "✓ Checking required fields..."
REQUIRED_FIELDS=("name" "version" "main" "module" "types" "dependencies" "peerDependencies")
for field in "${REQUIRED_FIELDS[@]}"; do
  VALUE=$(cat "$PACKAGE_JSON" | jq -r ".$field")
  if [ "$VALUE" = "null" ] || [ -z "$VALUE" ]; then
    echo -e "${RED}  ✗ Missing required field: $field${NC}"
  else
    echo -e "${GREEN}  ✓ $field: present${NC}"
  fi
done
echo ""

# Check 2: Verify internal packages use workspace protocol or "*"
echo "✓ Checking internal packages..."
INTERNAL_DEPS=$(cat "$PACKAGE_JSON" | jq -r '.dependencies | to_entries[] | select(.key | startswith("@canard") or startswith("@winglet")) | "\(.key): \(.value)"')

if [ -z "$INTERNAL_DEPS" ]; then
  echo -e "${YELLOW}  ⚠ No internal packages found${NC}"
else
  while IFS= read -r dep; do
    KEY=$(echo "$dep" | cut -d':' -f1)
    VALUE=$(echo "$dep" | cut -d':' -f2 | tr -d ' ')

    if [ "$VALUE" = "*" ] || [ "$VALUE" = "workspace:*" ]; then
      echo -e "${GREEN}  ✓ $KEY: $VALUE (correct)${NC}"
    else
      echo -e "${YELLOW}  ⚠ $KEY: $VALUE (should be '*' or 'workspace:*')${NC}"
    fi
  done <<< "$INTERNAL_DEPS"
fi
echo ""

# Check 3: Verify React version in peerDependencies
echo "✓ Checking React version..."
REACT_PEER=$(cat "$PACKAGE_JSON" | jq -r '.peerDependencies.react')
if [ "$REACT_PEER" = "null" ]; then
  echo -e "${RED}  ✗ React not found in peerDependencies${NC}"
elif [[ "$REACT_PEER" == *">=18.0.0"* ]]; then
  echo -e "${GREEN}  ✓ React: $REACT_PEER (compatible with @canard/schema-form)${NC}"
else
  echo -e "${YELLOW}  ⚠ React: $REACT_PEER (should include >=18.0.0)${NC}"
fi
echo ""

# Check 4: Verify version ranges
echo "✓ Checking version ranges..."
DEPS=$(cat "$PACKAGE_JSON" | jq -r '.dependencies | to_entries[] | select(.key | startswith("@canard") or startswith("@winglet") | not) | "\(.key): \(.value)"')

if [ ! -z "$DEPS" ]; then
  while IFS= read -r dep; do
    KEY=$(echo "$dep" | cut -d':' -f1)
    VALUE=$(echo "$dep" | cut -d':' -f2 | tr -d ' ')

    if [[ "$VALUE" == ^* ]]; then
      echo -e "${GREEN}  ✓ $KEY: $VALUE (using caret range)${NC}"
    elif [[ "$VALUE" == ~* ]]; then
      echo -e "${YELLOW}  ⚠ $KEY: $VALUE (tilde range, consider using caret ^)${NC}"
    elif [[ "$VALUE" == [0-9]* ]]; then
      echo -e "${YELLOW}  ⚠ $KEY: $VALUE (exact version, consider using range)${NC}"
    else
      echo -e "${GREEN}  ✓ $KEY: $VALUE${NC}"
    fi
  done <<< "$DEPS"
fi
echo ""

# Check 5: Compare dependencies and peerDependencies
echo "✓ Checking dependency/peerDependency consistency..."
DEPS_KEYS=$(cat "$PACKAGE_JSON" | jq -r '.dependencies | keys[]' | grep -v "@canard" | grep -v "@winglet" || true)
PEER_KEYS=$(cat "$PACKAGE_JSON" | jq -r '.peerDependencies | keys[]' || true)

if [ ! -z "$DEPS_KEYS" ]; then
  while IFS= read -r key; do
    if echo "$PEER_KEYS" | grep -q "^${key}$"; then
      DEP_VERSION=$(cat "$PACKAGE_JSON" | jq -r ".dependencies[\"$key\"]")
      PEER_VERSION=$(cat "$PACKAGE_JSON" | jq -r ".peerDependencies[\"$key\"]")
      echo -e "${GREEN}  ✓ $key: deps=$DEP_VERSION, peer=$PEER_VERSION${NC}"
    else
      echo -e "${YELLOW}  ⚠ $key: in dependencies but not in peerDependencies${NC}"
    fi
  done <<< "$DEPS_KEYS"
fi
echo ""

# Check 6: Verify exports field
echo "✓ Checking exports field..."
EXPORTS=$(cat "$PACKAGE_JSON" | jq -r '.exports')
if [ "$EXPORTS" = "null" ]; then
  echo -e "${YELLOW}  ⚠ No exports field (consider adding for better module resolution)${NC}"
else
  HAS_IMPORT=$(cat "$PACKAGE_JSON" | jq -r '.exports["."].import')
  HAS_REQUIRE=$(cat "$PACKAGE_JSON" | jq -r '.exports["."].require')
  HAS_TYPES=$(cat "$PACKAGE_JSON" | jq -r '.exports["."].types')

  if [ "$HAS_IMPORT" != "null" ]; then
    echo -e "${GREEN}  ✓ ESM import: $HAS_IMPORT${NC}"
  fi
  if [ "$HAS_REQUIRE" != "null" ]; then
    echo -e "${GREEN}  ✓ CJS require: $HAS_REQUIRE${NC}"
  fi
  if [ "$HAS_TYPES" != "null" ]; then
    echo -e "${GREEN}  ✓ TypeScript types: $HAS_TYPES${NC}"
  fi
fi
echo ""

# Check 7: Check for potential conflicts
echo "✓ Checking for common issues..."
HAS_REACT_DEP=$(cat "$PACKAGE_JSON" | jq -r '.dependencies.react')
if [ "$HAS_REACT_DEP" != "null" ]; then
  echo -e "${YELLOW}  ⚠ React in dependencies (should only be in peerDependencies)${NC}"
fi

HAS_REACT_DOM_DEP=$(cat "$PACKAGE_JSON" | jq -r '.dependencies["react-dom"]')
if [ "$HAS_REACT_DOM_DEP" != "null" ]; then
  echo -e "${YELLOW}  ⚠ react-dom in dependencies (should only be in peerDependencies)${NC}"
fi
echo ""

# Summary
echo "════════════════════════════════════════"
echo "Summary:"
echo "════════════════════════════════════════"
echo -e "${GREEN}✓ Validation complete${NC}"
echo ""
echo "Next steps:"
echo "  1. Review warnings (⚠) and fix if necessary"
echo "  2. Run 'yarn install' to verify dependencies"
echo "  3. Run 'yarn typecheck' to verify types"
echo ""
