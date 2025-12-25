#!/bin/bash

# =============================================================================
# NPM Granular Access Token Setup Script
#
# Usage: ./scripts/setup-npm-token.sh <NPM_TOKEN>
#
# Registers a Granular Access Token to ~/.zshrc as NPM_TOKEN environment variable.
# - Requires token with "Bypass two-factor authentication" option enabled
# - Token validity: up to 90 days
# - Yarn Berry reads NPM_TOKEN from .yarnrc.yml: npmAuthToken: "${NPM_TOKEN}"
# =============================================================================

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Shell config file
ZSHRC_FILE="$HOME/.zshrc"

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

echo -e "${BLUE}Setting up NPM token in ~/.zshrc...${NC}"
echo ""

# Calculate expiry date (90 days from now)
if [[ "$OSTYPE" == "darwin"* ]]; then
    EXPIRY_DATE=$(date -v+90d '+%Y-%m-%d')
else
    EXPIRY_DATE=$(date -d '+90 days' '+%Y-%m-%d')
fi

# =============================================================================
# Update ~/.zshrc file
# =============================================================================

if [ -f "$ZSHRC_FILE" ]; then
    echo -e "${YELLOW}Updating existing $ZSHRC_FILE${NC}"
    # Remove old NPM_TOKEN export and its comments
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' '/^# NPM Granular Access Token/d' "$ZSHRC_FILE"
        sed -i '' '/^# Added:/d' "$ZSHRC_FILE"
        sed -i '' '/^# Expires:/d' "$ZSHRC_FILE"
        sed -i '' '/^export NPM_TOKEN=/d' "$ZSHRC_FILE"
    else
        sed -i '/^# NPM Granular Access Token/d' "$ZSHRC_FILE"
        sed -i '/^# Added:/d' "$ZSHRC_FILE"
        sed -i '/^# Expires:/d' "$ZSHRC_FILE"
        sed -i '/^export NPM_TOKEN=/d' "$ZSHRC_FILE"
    fi
else
    echo -e "${BLUE}Creating $ZSHRC_FILE${NC}"
    touch "$ZSHRC_FILE"
fi

# Add token export with comments
cat >> "$ZSHRC_FILE" << EOF

# NPM Granular Access Token (Bypass 2FA enabled)
# Added: $CURRENT_DATE
# Expires: ~$EXPIRY_DATE (90 days from creation)
export NPM_TOKEN=$NPM_TOKEN
EOF

# Export for current session
export NPM_TOKEN="$NPM_TOKEN"

# =============================================================================
# Done
# =============================================================================

echo ""
echo -e "${GREEN}NPM token has been configured successfully!${NC}"
echo ""
echo "Token added to: $ZSHRC_FILE"
echo "Token also exported to current shell session."
echo ""
echo -e "${BLUE}To apply in other terminal sessions:${NC}"
echo "  source ~/.zshrc"
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
