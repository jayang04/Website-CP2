#!/bin/bash
# Markdown Cleanup Script
# Safe approach: Archives files instead of deleting them

echo "🧹 Starting Markdown Cleanup..."
echo ""

# Go to docs directory
cd /Users/azx/Desktop/Website-CP2/docs || exit

# Create archive folder
echo "📁 Creating archive folder..."
mkdir -p archive
echo "✅ Created docs/archive/"
echo ""

# Archive duplicates
echo "📦 Archiving duplicate files..."
mv -v README_NEW.md archive/ 2>/dev/null && echo "  ✓ Archived README_NEW.md"
mv -v README_OLD.md archive/ 2>/dev/null && echo "  ✓ Archived README_OLD.md"
mv -v INDEX_NEW.md archive/ 2>/dev/null && echo "  ✓ Archived INDEX_NEW.md"
echo ""

# Archive consolidated feature updates
echo "📦 Archiving consolidated feature updates..."
mv -v AUTO_REDIRECT_DASHBOARD.md archive/ 2>/dev/null && echo "  ✓ Archived AUTO_REDIRECT_DASHBOARD.md"
mv -v CONDITIONAL_PLAN_DISPLAY.md archive/ 2>/dev/null && echo "  ✓ Archived CONDITIONAL_PLAN_DISPLAY.md"
mv -v GENERAL_PROGRAM_DASHBOARD_UPDATE.md archive/ 2>/dev/null && echo "  ✓ Archived GENERAL_PROGRAM_DASHBOARD_UPDATE.md"
mv -v REHAB_PROGRAM_CONSOLIDATION.md archive/ 2>/dev/null && echo "  ✓ Archived REHAB_PROGRAM_CONSOLIDATION.md"
mv -v REPS_TRACKING_FIX.md archive/ 2>/dev/null && echo "  ✓ Archived REPS_TRACKING_FIX.md"
mv -v RESET_PROGRAM_FEATURE.md archive/ 2>/dev/null && echo "  ✓ Archived RESET_PROGRAM_FEATURE.md"
mv -v TAILWIND_FIX.md archive/ 2>/dev/null && echo "  ✓ Archived TAILWIND_FIX.md"
mv -v TAILWIND_INTEGRATION.md archive/ 2>/dev/null && echo "  ✓ Archived TAILWIND_INTEGRATION.md"
echo ""

# Count files
ARCHIVED_COUNT=$(ls archive/ 2>/dev/null | wc -l | tr -d ' ')
REMAINING_COUNT=$(ls *.md 2>/dev/null | wc -l | tr -d ' ')

echo "✅ Cleanup Complete!"
echo ""
echo "📊 Summary:"
echo "  • Archived: $ARCHIVED_COUNT files"
echo "  • Remaining: $REMAINING_COUNT markdown files"
echo ""
echo "📁 Archived files are in: docs/archive/"
echo "💡 You can permanently delete docs/archive/ later if everything works fine"
echo ""
echo "🎯 Next steps:"
echo "  1. Review remaining files in docs/"
echo "  2. Test your project to ensure nothing broke"
echo "  3. After 1-2 weeks, delete docs/archive/ if no issues"
echo ""
echo "🚀 Done!"
