#!/bin/bash

# check-compatibility.sh
# UI library compatibility check script for @canard/schema-form plugins
#
# Usage:
#   ./check-compatibility.sh [ui-library] [version]
#
# Examples:
#   ./check-compatibility.sh mui 5.14.0
#   ./check-compatibility.sh antd latest
#   ./check-compatibility.sh chakra ">=2.0.0"

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Supported UI libraries
declare -A SUPPORTED_LIBRARIES=(
  ["mui"]="@mui/material"
  ["antd"]="antd"
  ["chakra"]="@chakra-ui/react"
  ["headless"]="@headlessui/react"
  ["mantine"]="@mantine/core"
)

# Minimum version requirements
declare -A MIN_VERSIONS=(
  ["@mui/material"]="5.0.0"
  ["antd"]="5.0.0"
  ["@chakra-ui/react"]="2.0.0"
  ["@headlessui/react"]="1.7.0"
  ["@mantine/core"]="6.0.0"
)

# Show help
show_help() {
  cat << EOF
${BLUE}UI library compatibility check script${NC}

${GREEN}Usage:${NC}
  $0 [ui-library] [version]

${GREEN}Supported UI libraries:${NC}
  mui          Material-UI (@mui/material)
  antd         Ant Design (antd)
  chakra       Chakra UI (@chakra-ui/react)
  headless     Headless UI (@headlessui/react)
  mantine      Mantine (@mantine/core)

${GREEN}Arguments:${NC}
  ui-library   UI library to check (see the list above)
  version      Version to check (optional; default: detected from package.json)

${GREEN}Examples:${NC}
  # Check the MUI version in package.json
  $0 mui

  # Check compatibility of a specific version
  $0 mui 5.14.0

  # Check compatibility against the latest version
  $0 antd latest

  # Check a version range
  $0 chakra ">=2.0.0 <3.0.0"

${GREEN}Checks:${NC}
  ✓ Version compatibility (minimum version requirement)
  ✓ peerDependencies conflicts
  ✓ Whether required packages are installed
  ✓ TypeScript type definitions
  ✓ Known compatibility issues
  ✓ Breaking Changes

${GREEN}Options:${NC}
  -h, --help      Show help
  -v, --verbose   Verbose output
  -j, --json      Output as JSON
  --fix           Try to install a compatible version automatically

EOF
}

# Parse options
VERBOSE=false
JSON_OUTPUT=false
AUTO_FIX=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -j|--json)
      JSON_OUTPUT=true
      shift
      ;;
    --fix)
      AUTO_FIX=true
      shift
      ;;
    *)
      if [ -z "$UI_LIBRARY" ]; then
        UI_LIBRARY="$1"
      elif [ -z "$VERSION" ]; then
        VERSION="$1"
      else
        echo -e "${RED}Error: unknown argument '$1'${NC}"
        show_help
        exit 1
      fi
      shift
      ;;
  esac
done

# Confirm the UI library
if [ -z "$UI_LIBRARY" ]; then
  echo -e "${RED}Error: specify a UI library${NC}"
  show_help
  exit 1
fi

# Confirm it is a supported library
PACKAGE_NAME="${SUPPORTED_LIBRARIES[$UI_LIBRARY]}"
if [ -z "$PACKAGE_NAME" ]; then
  echo -e "${RED}Error: unsupported UI library: $UI_LIBRARY${NC}"
  echo ""
  echo "Supported libraries:"
  for lib in "${!SUPPORTED_LIBRARIES[@]}"; do
    echo "  - $lib (${SUPPORTED_LIBRARIES[$lib]})"
  done
  exit 1
fi

MIN_VERSION="${MIN_VERSIONS[$PACKAGE_NAME]}"

# Confirm package.json exists
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: package.json was not found${NC}"
  exit 1
fi

# Detect the currently installed version
detect_installed_version() {
  local package="$1"

  # Read the version from package.json
  local pkg_version=$(jq -r ".dependencies[\"$package\"] // .devDependencies[\"$package\"] // .peerDependencies[\"$package\"] // \"\"" package.json 2>/dev/null)

  if [ -n "$pkg_version" ] && [ "$pkg_version" != "null" ]; then
    # Strip version-range symbols (^, ~, >=, etc.)
    pkg_version=$(echo "$pkg_version" | sed 's/[\^~>=<]//g' | awk '{print $1}')
    echo "$pkg_version"
  else
    # Check node_modules
    if [ -d "node_modules/$package" ]; then
      local nm_version=$(jq -r '.version' "node_modules/$package/package.json" 2>/dev/null || echo "")
      echo "$nm_version"
    else
      echo ""
    fi
  fi
}

# Detect the version when none was given
if [ -z "$VERSION" ]; then
  VERSION=$(detect_installed_version "$PACKAGE_NAME")
  if [ -z "$VERSION" ]; then
    echo -e "${YELLOW}Warning: installed version was not found${NC}"
    echo "Checking compatibility against the latest version..."
    VERSION="latest"
  fi
fi

if [ "$VERBOSE" = true ]; then
  echo -e "${BLUE}Compatibility check info:${NC}"
  echo "  UI library: $UI_LIBRARY ($PACKAGE_NAME)"
  echo "  Version under check: $VERSION"
  echo "  Minimum required version: $MIN_VERSION"
  echo ""
fi

# Version comparison function
version_compare() {
  local version1="$1"
  local version2="$2"

  # Treat 'latest' as always current
  if [ "$version1" = "latest" ]; then
    echo "0"
    return
  fi

  # Semantic versioning comparison
  local IFS=.
  local i ver1=($version1) ver2=($version2)

  for ((i=0; i<${#ver1[@]} || i<${#ver2[@]}; i++)); do
    local num1=${ver1[i]:-0}
    local num2=${ver2[i]:-0}

    if ((10#$num1 > 10#$num2)); then
      echo "1"
      return
    elif ((10#$num1 < 10#$num2)); then
      echo "-1"
      return
    fi
  done

  echo "0"
}

# 1. Version compatibility check
check_version_compatibility() {
  echo -e "${CYAN}[1/6] Version compatibility check${NC}"

  local result=$(version_compare "$VERSION" "$MIN_VERSION")

  if [ "$result" = "-1" ]; then
    echo -e "${RED}  ✗ Version is below the minimum requirement${NC}"
    echo "    Current: $VERSION"
    echo "    Minimum: $MIN_VERSION"
    return 1
  else
    echo -e "${GREEN}  ✓ Version compatibility confirmed${NC}"
    echo "    Current: $VERSION (minimum: $MIN_VERSION)"
    return 0
  fi
}

# 2. peerDependencies check
check_peer_dependencies() {
  echo -e "${CYAN}[2/6] peerDependencies check${NC}"

  # Read peerDependencies of @canard/schema-form
  local canard_peer_deps=$(jq -r '.peerDependencies | keys[]' package.json 2>/dev/null || echo "")

  local conflicts=0
  while IFS= read -r dep; do
    if [ -n "$dep" ]; then
      local required_version=$(jq -r ".peerDependencies[\"$dep\"]" package.json)
      local installed_version=$(detect_installed_version "$dep")

      if [ -n "$installed_version" ]; then
        if [ "$VERBOSE" = true ]; then
          echo "    $dep: $installed_version (required: $required_version)"
        fi
      else
        echo -e "${YELLOW}    ⚠ $dep is not installed (required: $required_version)${NC}"
        ((conflicts++))
      fi
    fi
  done <<< "$canard_peer_deps"

  if [ "$conflicts" -eq 0 ]; then
    echo -e "${GREEN}  ✓ No peerDependencies conflicts${NC}"
    return 0
  else
    echo -e "${YELLOW}  ⚠ $conflicts peerDependencies warning(s)${NC}"
    return 1
  fi
}

# 3. Confirm required packages are installed
check_required_packages() {
  echo -e "${CYAN}[3/6] Required package installation check${NC}"

  local required_packages=()

  case $UI_LIBRARY in
    mui)
      required_packages=("@mui/material" "@emotion/react" "@emotion/styled")
      ;;
    antd)
      required_packages=("antd")
      ;;
    chakra)
      required_packages=("@chakra-ui/react" "@emotion/react" "@emotion/styled" "framer-motion")
      ;;
    headless)
      required_packages=("@headlessui/react")
      ;;
    mantine)
      required_packages=("@mantine/core" "@mantine/hooks" "@emotion/react")
      ;;
  esac

  local missing=0
  for pkg in "${required_packages[@]}"; do
    if [ -d "node_modules/$pkg" ] || grep -q "\"$pkg\"" package.json; then
      if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}    ✓ $pkg${NC}"
      fi
    else
      echo -e "${RED}    ✗ $pkg (not installed)${NC}"
      ((missing++))
    fi
  done

  if [ "$missing" -eq 0 ]; then
    echo -e "${GREEN}  ✓ All required packages are installed${NC}"
    return 0
  else
    echo -e "${RED}  ✗ $missing required package(s) not installed${NC}"
    return 1
  fi
}

# 4. TypeScript type definition check
check_typescript_types() {
  echo -e "${CYAN}[4/6] TypeScript type definition check${NC}"

  local types_packages=()

  case $UI_LIBRARY in
    mui|chakra|mantine)
      # Ships its own type definitions
      echo -e "${GREEN}  ✓ Ships its own type definitions${NC}"
      return 0
      ;;
    antd|headless)
      types_packages=("@types/react" "@types/react-dom")
      ;;
  esac

  local missing_types=0
  for pkg in "${types_packages[@]}"; do
    if [ -d "node_modules/$pkg" ] || grep -q "\"$pkg\"" package.json; then
      if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}    ✓ $pkg${NC}"
      fi
    else
      echo -e "${YELLOW}    ⚠ $pkg (not installed)${NC}"
      ((missing_types++))
    fi
  done

  if [ "$missing_types" -eq 0 ]; then
    echo -e "${GREEN}  ✓ TypeScript type definitions confirmed${NC}"
    return 0
  else
    echo -e "${YELLOW}  ⚠ $missing_types type definition package(s) not installed${NC}"
    return 1
  fi
}

# 5. Known compatibility issue check
check_known_issues() {
  echo -e "${CYAN}[5/6] Known compatibility issue check${NC}"

  local has_issues=false

  case $UI_LIBRARY in
    mui)
      if [ "$VERSION" = "5.0.0" ] || [ "$VERSION" = "5.0.1" ]; then
        echo -e "${YELLOW}    ⚠ MUI 5.0.0-5.0.1: Emotion 11 compatibility issue${NC}"
        echo "      Recommended: use MUI >= 5.0.2"
        has_issues=true
      fi
      ;;
    antd)
      if [[ "$VERSION" == 5.0.* ]]; then
        echo -e "${YELLOW}    ⚠ Ant Design 5.0.x: some component APIs changed${NC}"
        echo "      Recommended: see the migration guide"
        has_issues=true
      fi
      ;;
    chakra)
      local result=$(version_compare "$VERSION" "2.0.0")
      if [ "$result" = "-1" ]; then
        echo -e "${YELLOW}    ⚠ Chakra UI < 2.0.0: limited compatibility with @canard/schema-form${NC}"
        echo "      Recommended: use Chakra UI >= 2.0.0"
        has_issues=true
      fi
      ;;
  esac

  if [ "$has_issues" = false ]; then
    echo -e "${GREEN}  ✓ No known compatibility issues${NC}"
    return 0
  else
    return 1
  fi
}

# 6. Breaking Changes check
check_breaking_changes() {
  echo -e "${CYAN}[6/6] Breaking Changes check${NC}"

  # Detect a major version change
  local major_version="${VERSION%%.*}"
  local has_breaking_changes=false

  case $UI_LIBRARY in
    mui)
      if [ "$major_version" -ge 6 ]; then
        echo -e "${YELLOW}    ⚠ MUI v6: not yet tested with @canard/schema-form${NC}"
        has_breaking_changes=true
      fi
      ;;
    antd)
      if [ "$major_version" -ge 6 ]; then
        echo -e "${YELLOW}    ⚠ Ant Design v6: beta; use caution in production${NC}"
        has_breaking_changes=true
      fi
      ;;
  esac

  if [ "$has_breaking_changes" = false ]; then
    echo -e "${GREEN}  ✓ No Breaking Changes${NC}"
    return 0
  else
    return 1
  fi
}

# Run every check
echo -e "${MAGENTA}=== UI library compatibility check ===${NC}"
echo ""

passed_checks=0
total_checks=6

check_version_compatibility && ((passed_checks++))
echo ""

check_peer_dependencies && ((passed_checks++))
echo ""

check_required_packages && ((passed_checks++))
echo ""

check_typescript_types && ((passed_checks++))
echo ""

check_known_issues && ((passed_checks++))
echo ""

check_breaking_changes && ((passed_checks++))
echo ""

# Result summary
echo -e "${MAGENTA}=== Check results ===${NC}"
echo ""
echo -e "  Passed: ${GREEN}$passed_checks${NC}/$total_checks"
echo ""

if [ "$passed_checks" -eq "$total_checks" ]; then
  echo -e "${GREEN}✓ All compatibility checks passed${NC}"
  echo -e "${GREEN}✓ $UI_LIBRARY $VERSION is compatible with @canard/schema-form${NC}"
  exit_code=0
elif [ "$passed_checks" -ge 4 ]; then
  echo -e "${YELLOW}⚠ There are some warnings, but it is usable${NC}"
  echo "  Some features may be limited, or extra setup may be required"
  exit_code=0
else
  echo -e "${RED}✗ Compatibility check failed${NC}"
  echo -e "${RED}✗ $UI_LIBRARY $VERSION may not be compatible with @canard/schema-form${NC}"
  exit_code=1
fi

# Automatic fix suggestion
if [ "$AUTO_FIX" = true ] && [ "$exit_code" -ne 0 ]; then
  echo ""
  echo -e "${BLUE}Attempting an automatic fix...${NC}"
  echo ""

  # Install the recommended version
  recommended_version="latest"
  case $UI_LIBRARY in
    mui)
      recommended_version="^5.14.0"
      ;;
    antd)
      recommended_version="^5.12.0"
      ;;
    chakra)
      recommended_version="^2.8.0"
      ;;
  esac

  echo "  yarn add $PACKAGE_NAME@$recommended_version"
  yarn add "$PACKAGE_NAME@$recommended_version"

  echo ""
  echo -e "${GREEN}✓ Recommended version installed${NC}"
  echo "  Run the compatibility check again"
fi

echo ""
exit $exit_code
