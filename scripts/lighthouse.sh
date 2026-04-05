#!/bin/bash

set -euo pipefail

echo "Running Lighthouse accessibility audit..."
vp exec lhci autorun
echo ""
echo "Accessibility audit completed"
