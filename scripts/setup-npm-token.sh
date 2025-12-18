#!/bin/bash

# =============================================================================
# NPM Granular Access Token Setup Script
#
# Usage: ./scripts/setup-npm-token.sh <NPM_TOKEN>
#
# Registers a Granular Access Token to project's .npmrc file.
# - Requires token with "Bypass two-factor authentication" option enabled
# - Token validity: up to 90 days
# - Token is stored per-project, not globally
# - Yarn Berry automatically reads .npmrc for authentication
# =============================================================================

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project root (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NPMRC_FILE="$PROJECT_ROOT/.npmrc"

# Check token argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: NPM token is required.${NC}"
    echo ""
    echo "Usage: $0 <NPM_TOKEN>"
    echo ""
    echo "How to generate a token:"
    echo "  1. Visit https://www.npmjs.com/settings/~/tokens"
    echo "  2. Click 'Generate New Token' -> Select 'Granular Access Token'"
    echo "  3. Make sure to check 'Bypass two-factor authentication'"
    echo "  4. Copy the generated token and run this script"
    exit 1
fi

NPM_TOKEN="$1"
CURRENT_DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Validate token format (should start with npm_)
if [[ ! "$NPM_TOKEN" =~ ^npm_ ]]; then
    echo -e "${YELLOW}Warning: Token does not start with 'npm_'. Please verify this is a Granular Access Token.${NC}"
fi

echo -e "${BLUE}Setting up NPM token for project...${NC}"
echo ""

# Calculate expiry date (90 days from now)
if [[ "$OSTYPE" == "darwin"* ]]; then
    EXPIRY_DATE=$(date -v+90d '+%Y-%m-%d')
else
    EXPIRY_DATE=$(date -d '+90 days' '+%Y-%m-%d')
fi

# =============================================================================
# Update project .npmrc file
# =============================================================================

if [ -f "$NPMRC_FILE" ]; then
    echo -e "${YELLOW}Updating existing $NPMRC_FILE${NC}"
    # Remove old token line and its comments
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' '/^# NPM Granular Access Token/d' "$NPMRC_FILE"
        sed -i '' '/^# Added:/d' "$NPMRC_FILE"
        sed -i '' '/^# Expires:/d' "$NPMRC_FILE"
        sed -i '' '/^\/\/registry.npmjs.org\/:_authToken=/d' "$NPMRC_FILE"
    else
        sed -i '/^# NPM Granular Access Token/d' "$NPMRC_FILE"
        sed -i '/^# Added:/d' "$NPMRC_FILE"
        sed -i '/^# Expires:/d' "$NPMRC_FILE"
        sed -i '/^\/\/registry.npmjs.org\/:_authToken=/d' "$NPMRC_FILE"
    fi
else
    echo -e "${BLUE}Creating $NPMRC_FILE${NC}"
    touch "$NPMRC_FILE"
fi

# Add token with comments
cat >> "$NPMRC_FILE" << EOF
# NPM Granular Access Token (Bypass 2FA enabled)
# Added: $CURRENT_DATE
# Expires: ~$EXPIRY_DATE (90 days from creation)
//registry.npmjs.org/:_authToken=$NPM_TOKEN
EOF

# Secure file permissions
chmod 600 "$NPMRC_FILE"

# =============================================================================
# Done
# =============================================================================

echo ""
echo -e "${GREEN}NPM token has been configured successfully!${NC}"
echo ""
echo "Token stored in: $NPMRC_FILE"
echo ""
echo -e "${BLUE}Verify configuration:${NC}"
echo "  yarn npm whoami"
echo ""
echo -e "${BLUE}Publish packages:${NC}"
echo "  yarn publish:all                                  # All packages"
echo "  yarn workspace @winglet/common-utils publish:npm  # Single package"
echo ""
echo -e "${YELLOW}Note: Token expires around $EXPIRY_DATE. Remember to renew before then.${NC}"
echo ""
