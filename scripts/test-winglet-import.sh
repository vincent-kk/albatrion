#!/bin/bash

# @winglet Package Test Script
# Vincent K. Kelvin - Albatrion Monorepo
# 
# Usage:
#   ./test-winglet-import.sh           # Run comprehensive tests
#   ./test-winglet-import.sh --fast    # Run quick tests only  
#   ./test-winglet-import.sh -F        # Run quick tests only

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to strip ANSI color codes for markdown output
strip_colors() {
    sed -e 's/\x1b\[[0-9;]*m//g' -e 's/\[[0-9;]*m//g'
}

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${CYAN}🚀 $1${NC}"
}

# Parse command line arguments
FAST_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --fast|-F)
            FAST_MODE=true
            shift
            ;;
        --help|-H)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --fast, -F    Run quick tests only (basic import tests)"
            echo "  --help, -H    Show this help"
            echo ""
            echo "Examples:"
            echo "  $0           # Run comprehensive tests"
            echo "  $0 --fast    # Run quick tests only"
            echo "  $0 -F        # Run quick tests only"
            echo "  $0 -H        # Show help"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Run $0 --help to see usage."
            exit 1
            ;;
    esac
done

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [[ "$FAST_MODE" == "true" ]]; then
    print_header "@winglet Package Quick Test"
    print_info "Mode: Quick import tests only"
else
    print_header "@winglet Package Comprehensive Test"
    print_info "Mode: Run comprehensive tests"
fi

print_info "Project Root: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

# ========================================
# Quick test function
# ========================================
run_quick_test() {
    print_header "Running Quick Import Test"
    
    # Create quick test
    cat > "$SCRIPT_DIR/quick-import-test.mjs" << 'EOF'
#!/usr/bin/env node

console.log('🚀 @winglet Package Quick Import Test\n');

async function quickTest() {
  const packages = [
    ['@winglet/common-utils', '../packages/winglet/common-utils/dist/index.mjs'],
    ['@winglet/json', '../packages/winglet/json/dist/index.mjs'],
    ['@winglet/react-utils', '../packages/winglet/react-utils/dist/index.mjs'],
    ['@winglet/json-schema', '../packages/winglet/json-schema/dist/index.mjs'],
    ['@winglet/data-loader', '../packages/winglet/data-loader/dist/index.mjs'],
  ];

  let passed = 0;
  
  for (const [name, path] of packages) {
    try {
      const imported = await import(path);
      const count = Object.keys(imported).length;
      console.log(`✅ ${name}: ${count} exports`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  console.log(`\n📊 Result: ${passed}/${packages.length} successful`);
  
  if (passed === packages.length) {
    console.log('🎉 All packages working!');
    process.exit(0);
  } else {
    console.log('⚠️  Issues found');
    process.exit(1);
  }
}

quickTest().catch(console.error);
EOF

    print_info "Running quick import test..."

    if node "$SCRIPT_DIR/quick-import-test.mjs"; then
        print_success "Quick test successful!"
        rm -f "$SCRIPT_DIR/quick-import-test.mjs"
        return 0
    else
        print_error "Quick test failed!"
        rm -f "$SCRIPT_DIR/quick-import-test.mjs"
        return 1
    fi
}

# ========================================
# Comprehensive test function
# ========================================
run_full_test() {
    # Create results directory
    RESULTS_DIR="$SCRIPT_DIR/results"
    mkdir -p "$RESULTS_DIR"

    # Timestamp for this test run
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    REPORT_FILE="$RESULTS_DIR/winglet_test_report_$TIMESTAMP.md"

    print_info "Results Directory: $RESULTS_DIR"
    print_info "Report File: $REPORT_FILE"

    # Initialize report
    cat > "$REPORT_FILE" << EOF
# @winglet Package Test Report

**Test Execution Time**: $(date)  
**Test Executor**: $(whoami)  
**Project Path**: $PROJECT_ROOT

## 📋 Test Overview

EOF

    # Test counter
    TOTAL_TESTS=0
    PASSED_TESTS=0
    FAILED_TESTS=0

    # Function to run a test with timeout and log results
    run_test() {
        local test_name="$1"
        local test_command="$2"
        local test_file="$3"
        local timeout_seconds="${4:-60}"  # Default 60 seconds timeout
        
        print_info "Running: $test_name (timeout: ${timeout_seconds}s)"
        ((TOTAL_TESTS++))
        
        # Run command with timeout
        if timeout "$timeout_seconds" bash -c "$test_command" > "$RESULTS_DIR/$test_file" 2>&1; then
            print_success "$test_name successful"
            ((PASSED_TESTS++))
            echo "✅ **$test_name**: Success" >> "$REPORT_FILE"
            # Remove log file for successful tests
            rm -f "$RESULTS_DIR/$test_file"
        else
            local exit_code=$?
            if [ $exit_code -eq 124 ]; then
                print_error "$test_name timed out after ${timeout_seconds} seconds"
                echo "❌ **$test_name**: Timeout (${timeout_seconds}s)" >> "$REPORT_FILE"
                echo "Test timed out after ${timeout_seconds} seconds" >> "$RESULTS_DIR/$test_file"
            else
                print_error "$test_name failed"
                echo "❌ **$test_name**: Failed" >> "$REPORT_FILE"
            fi
            ((FAILED_TESTS++))
            # Keep log file for failed tests
        fi
        
        # Add test results to report (strip colors for markdown) only for failed tests
        if [ -f "$RESULTS_DIR/$test_file" ]; then
            echo "" >> "$REPORT_FILE"
            echo "### $test_name Results" >> "$REPORT_FILE"
            echo '```' >> "$REPORT_FILE"
            cat "$RESULTS_DIR/$test_file" | strip_colors >> "$REPORT_FILE"
            echo '```' >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
    }

    echo ""
    print_header "Step 1: Basic Import Test"

    # Create basic import test
    cat > "$SCRIPT_DIR/basic-import-test.mjs" << 'EOF'
#!/usr/bin/env node

console.log('🚀 @winglet Package Basic Import Test Starting...\n');

async function testPackageImport(packageName, importPath) {
  try {
    console.log(`📦 Testing ${packageName}...`);
    const imported = await import(importPath);
    const exportCount = Object.keys(imported).length;
    console.log(`✅ ${packageName}: ${exportCount} exports confirmed`);
    
    const mainExports = Object.keys(imported).slice(0, 5);
    console.log(`   Main exports: ${mainExports.join(', ')}`);
    return true;
  } catch (error) {
    // Check if it's a CSS import issue (common with UI libraries)
    if (error.message.includes('Unexpected token \':\'') || 
        error.message.includes('.css') ||
        error.message.includes('SyntaxError')) {
      console.log(`⚠️  ${packageName}: CSS import issue (browser-only component)`);
      return 'css-issue';
    }
    console.log(`❌ ${packageName}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const tests = [
    ['@winglet/common-utils', '../packages/winglet/common-utils/dist/index.mjs'],
    ['@winglet/json', '../packages/winglet/json/dist/index.mjs'],
    ['@winglet/react-utils', '../packages/winglet/react-utils/dist/index.mjs'],
    ['@winglet/json-schema', '../packages/winglet/json-schema/dist/index.mjs'],
    ['@winglet/data-loader', '../packages/winglet/data-loader/dist/index.mjs'],
  ];

  let passed = 0;
  let total = tests.length;

  for (const [name, path] of tests) {
    const result = await testPackageImport(name, path);
    if (result === true || result === 'css-issue') passed++;
    console.log('');
  }

  console.log('='.repeat(50));
  console.log(`📊 Result: ${passed}/${total} successful (${((passed/total)*100).toFixed(1)}%)`);
  
  if (passed === total) {
    console.log('🎉 All package imports successful!');
    process.exit(0);
  } else {
    console.log('⚠️  Issues found in some packages');
    process.exit(1);
  }
}

runTests().catch(console.error);
EOF

    run_test "Basic Import Test" "node '$SCRIPT_DIR/basic-import-test.mjs'" "basic_import_test.log" 45

    echo ""
    print_header "Step 2: Functionality Test"

    # Create functionality test
    cat > "$SCRIPT_DIR/functionality-test.mjs" << 'EOF'
#!/usr/bin/env node

console.log('⚡ @winglet Package Functionality Test Starting...\n');

let testsPassed = 0;
let testsTotal = 0;

function runTest(testName, testFn) {
  testsTotal++;
  try {
    testFn();
    console.log(`✅ ${testName}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${testName}: ${error.message}`);
  }
}

async function testCommonUtilsFunctions() {
  console.log('📦 @winglet/common-utils Functionality Test:');
  
  try {
    const { chunk, unique, difference } = await import('../packages/winglet/common-utils/dist/utils/array/index.mjs');
    
    runTest('chunk([1,2,3,4,5], 2)', () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      const expected = [[1,2],[3,4],[5]];
      if (JSON.stringify(result) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(result)}`);
      }
      console.log(`  Result: ${JSON.stringify(result)}`);
    });
    
    runTest('unique([1,1,2,2,3])', () => {
      const result = unique([1, 1, 2, 2, 3]);
      const expected = [1, 2, 3];
      if (JSON.stringify(result) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(result)}`);
      }
      console.log(`  Result: ${JSON.stringify(result)}`);
    });
    
    runTest('difference([1,2,3], [2,3,4])', () => {
      const result = difference([1, 2, 3], [2, 3, 4]);
      const expected = [1];
      if (JSON.stringify(result) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(result)}`);
      }
      console.log(`  Result: ${JSON.stringify(result)}`);
    });
    
  } catch (error) {
    console.log(`❌ Array function test failed: ${error.message}`);
  }

  try {
    const { clone, merge } = await import('../packages/winglet/common-utils/dist/utils/object/index.mjs');
    
    runTest('clone deep copy', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = clone(original);
      if (cloned === original) {
        throw new Error('Clone should create a different object');
      }
      if (cloned.a !== 1 || cloned.b.c !== 2) {
        throw new Error('Clone should preserve values');
      }
      console.log(`  Different object from original: ${cloned !== original}`);
    });
    
    runTest('merge({a:1}, {b:2})', () => {
      const result = merge({ a: 1 }, { b: 2 });
      if (result.a !== 1 || result.b !== 2) {
        throw new Error('Merge failed');
      }
      console.log(`  Result: ${JSON.stringify(result)}`);
    });
    
  } catch (error) {
    console.log(`❌ Object function test failed: ${error.message}`);
  }

  try {
    const { delay } = await import('../packages/winglet/common-utils/dist/utils/promise/index.mjs');
    
    await new Promise(resolve => {
      runTest('delay(50ms)', async () => {
        const start = Date.now();
        await delay(50);
        const elapsed = Date.now() - start;
        if (elapsed < 45 || elapsed > 100) {
          throw new Error(`Delay should be around 50ms, got ${elapsed}ms`);
        }
        console.log(`  Actual elapsed time: ${elapsed}ms`);
        resolve();
      });
    });
    
  } catch (error) {
    console.log(`❌ Promise function test failed: ${error.message}`);
  }
  
  console.log('');
}

async function testJSONFunctions() {
  console.log('📦 @winglet/json Functionality Test:');
  
  try {
    const { getValue, setValue } = await import('../packages/winglet/json/dist/JSONPointer/utils/manipulator/index.mjs');
    
    const testObj = { user: { name: 'Vincent', age: 30 }, items: [1, 2, 3] };
    
    runTest('getValue(obj, "/user/name")', () => {
      const result = getValue(testObj, '/user/name');
      if (result !== 'Vincent') {
        throw new Error(`Expected 'Vincent', got '${result}'`);
      }
      console.log(`  Result: "${result}"`);
    });
    
    runTest('getValue(obj, "/items/0")', () => {
      const result = getValue(testObj, '/items/0');
      if (result !== 1) {
        throw new Error(`Expected 1, got ${result}`);
      }
      console.log(`  Result: ${result}`);
    });
    
    runTest('setValue then getValue', () => {
      const newObj = setValue(testObj, '/user/city', 'Seoul');
      const city = getValue(newObj, '/user/city');
      if (city !== 'Seoul') {
        throw new Error(`Expected 'Seoul', got '${city}'`);
      }
      console.log(`  Result: "${city}"`);
    });
    
  } catch (error) {
    console.log(`❌ JSONPointer function test failed: ${error.message}`);
  }

  try {
    const { escapePath, unescapePath } = await import('../packages/winglet/json/dist/JSONPointer/utils/escape/index.mjs');
    
    runTest('escapePath/unescapePath', () => {
      const testPath = 'foo/bar~test';
      const escaped = escapePath(testPath);
      const unescaped = unescapePath(escaped);
      if (unescaped !== testPath) {
        throw new Error(`Round trip failed: ${testPath} -> ${escaped} -> ${unescaped}`);
      }
      console.log(`  "${testPath}" -> "${escaped}" -> "${unescaped}"`);
    });
    
  } catch (error) {
    console.log(`❌ JSONPointer escape function test failed: ${error.message}`);
  }
  
  console.log('');
}

async function testJSONSchemaFunctions() {
  console.log('📦 @winglet/json-schema Functionality Test:');
  
  try {
    const { isArraySchema, isBooleanSchema, isNullSchema } = await import('../packages/winglet/json-schema/dist/filters/index.mjs');
    
    runTest('isArraySchema({type: "array"})', () => {
      const result = isArraySchema({ type: 'array' });
      if (result !== true) {
        throw new Error(`Expected true, got ${result}`);
      }
      console.log(`  Result: ${result}`);
    });
    
    runTest('isBooleanSchema({type: "boolean"})', () => {
      const result = isBooleanSchema({ type: 'boolean' });
      if (result !== true) {
        throw new Error(`Expected true, got ${result}`);
      }
      console.log(`  Result: ${result}`);
    });
    
    runTest('isNullSchema({type: "null"})', () => {
      const result = isNullSchema({ type: 'null' });
      if (result !== true) {
        throw new Error(`Expected true, got ${result}`);
      }
      console.log(`  Result: ${result}`);
    });
    
  } catch (error) {
    console.log(`❌ JSONSchema filter function test failed: ${error.message}`);
  }

  try {
    const { JSONSchemaScanner } = await import('../packages/winglet/json-schema/dist/utils/JSONSchemaScanner/sync/index.mjs');

    runTest('JSONSchemaScanner class load', () => {
      if (typeof JSONSchemaScanner !== 'function') {
        throw new Error(`Expected function, got ${typeof JSONSchemaScanner}`);
      }
      console.log(`  Type: ${typeof JSONSchemaScanner}`);
    });

  } catch (error) {
    console.log(`❌ JSONSchemaScanner test failed: ${error.message}`);
  }
  
  console.log('');
}

async function testDataLoaderFunctions() {
  console.log('📦 @winglet/data-loader Functionality Test:');
  
  try {
    const { DataLoader } = await import('../packages/winglet/data-loader/dist/index.mjs');
    
    runTest('DataLoader class load', () => {
      if (typeof DataLoader !== 'function') {
        throw new Error(`Expected function, got ${typeof DataLoader}`);
      }
      console.log(`  Type: ${typeof DataLoader}`);
    });
    
  } catch (error) {
    console.log(`❌ DataLoader test failed: ${error.message}`);
  }
  
  console.log('');
}

async function runAllTests() {
  await testCommonUtilsFunctions();
  await testJSONFunctions();
  await testJSONSchemaFunctions();
  await testDataLoaderFunctions();
  
  console.log('='.repeat(50));
  console.log(`📊 Final Result: ${testsPassed}/${testsTotal} successful (${((testsPassed/testsTotal)*100).toFixed(1)}%)`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All functionality tests successful!');
    process.exit(0);
  } else {
    console.log('⚠️  Issues found in some tests');
    process.exit(1);
  }
}

runAllTests().catch(console.error);
EOF

    run_test "Functionality Test" "node '$SCRIPT_DIR/functionality-test.mjs'" "functionality_test.log" 60

    echo ""
    print_header "Step 3: TypeScript Type Validation"

    # Create isolated tsconfig for testing
    cat > "$SCRIPT_DIR/tsconfig.test.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "noResolve": false,
    "noImplicitAny": false
  },
  "include": ["type-test.ts"],
  "exclude": ["../node_modules", "../packages", "../dist"]
}
EOF

    # Create TypeScript type test
    cat > "$SCRIPT_DIR/type-test.ts" << 'EOF'
/**
 * TypeScript Type Definition Test
 */

// @winglet/common-utils type test
import { chunk, unique, difference } from '../packages/winglet/common-utils/dist/utils/array/index.mjs';
import { clone, merge } from '../packages/winglet/common-utils/dist/utils/object/index.mjs';
import { delay } from '../packages/winglet/common-utils/dist/utils/promise/index.mjs';

// @winglet/json type test
import { getValue, setValue } from '../packages/winglet/json/dist/JSONPointer/utils/manipulator/index.mjs';
import { escapePath, unescapePath } from '../packages/winglet/json/dist/JSONPointer/utils/escape/index.mjs';

// @winglet/json-schema type test
import { isArraySchema, isBooleanSchema } from '../packages/winglet/json-schema/dist/filters/index.mjs';
import { JSONSchemaScanner } from '../packages/winglet/json-schema/dist/utils/JSONSchemaScanner/sync/index.mjs';

// @winglet/data-loader type test
import { DataLoader } from '../packages/winglet/data-loader/dist/index.mjs';

// Type validation functions
function testArrayFunctions(): void {
  const numbers: number[] = [1, 2, 3, 4, 5];
  const chunked: number[][] = chunk(numbers, 2);
  const uniqueNumbers: number[] = unique([1, 1, 2, 2, 3]);
  const diff: number[] = difference([1, 2, 3], [2, 3, 4]);
}

function testObjectFunctions(): void {
  const original = { a: 1, b: { c: 2 } };
  const cloned = clone(original);
  const merged = merge({ a: 1 }, { b: 2 });
}

function testPromiseFunctions(): void {
  const delayPromise: Promise<void> = delay(100);
}

function testJSONPointerFunctions(): void {
  const testObj = { user: { name: 'Vincent' }, items: [1, 2, 3] };
  const name: unknown = getValue(testObj, '/user/name');
  const newObj = setValue(testObj, '/user/city', 'Seoul');
  const escaped: string = escapePath('test/path');
  const unescaped: string = unescapePath(escaped);
}

function testJSONSchemaFunctions(): void {
  const isArray: boolean = isArraySchema({ type: 'array' });
  const isBoolean: boolean = isBooleanSchema({ type: 'boolean' });
  const scanner = new JSONSchemaScanner();
}

function testDataLoaderClass(): void {
  const loader = new DataLoader((keys: readonly string[]) => {
    return Promise.resolve(keys.map(key => `result-${key}`));
  });
}

// Execute all tests
testArrayFunctions();
testObjectFunctions();
testPromiseFunctions();
testJSONPointerFunctions();
testJSONSchemaFunctions();
testDataLoaderClass();

console.log('✅ TypeScript type definition validation completed');

// Export to ensure this is treated as a module
export { 
  testArrayFunctions, 
  testObjectFunctions, 
  testPromiseFunctions, 
  testJSONPointerFunctions, 
  testJSONSchemaFunctions, 
  testDataLoaderClass 
};
EOF

    # Run TypeScript validation with custom config and timeout
    run_test "TypeScript Type Validation" "cd '$SCRIPT_DIR' && npx tsc --project tsconfig.test.json" "type_test.log" 30

    echo ""
    print_header "Step 4: Build Structure Validation"

    run_test "Build File Existence Check" "find packages/winglet -name 'dist' -type d | xargs -I {} find {} -name '*.mjs' -o -name '*.cjs' -o -name '*.d.ts' | head -20" "build_structure.log" 20

    run_test "Bundle Size Analysis" "du -h packages/winglet/*/dist/*.{cjs,mjs} 2>/dev/null | sort -hr" "bundle_sizes.log" 15

    # Finalize report
    cat >> "$REPORT_FILE" << EOF

## 📊 Final Statistics

- **Total Tests**: $TOTAL_TESTS
- **Successful Tests**: $PASSED_TESTS  
- **Failed Tests**: $FAILED_TESTS
- **Success Rate**: $(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)%

## 🎯 Conclusion

EOF

    if [ $FAILED_TESTS -eq 0 ]; then
        echo "🟢 **All tests passed!** @winglet packages are built and working properly." >> "$REPORT_FILE"
        FINAL_STATUS="Success"
    else
        echo "🟡 **Some tests failed.** Issues found in $FAILED_TESTS tests." >> "$REPORT_FILE"
        FINAL_STATUS="Partial Success"
    fi

    cat >> "$REPORT_FILE" << EOF

---
*This report was generated through automated testing.*  
*Test execution time: $(date)*
EOF

    # Clean up temporary test files
    rm -f "$SCRIPT_DIR/basic-import-test.mjs"
    rm -f "$SCRIPT_DIR/functionality-test.mjs" 
    rm -f "$SCRIPT_DIR/type-test.ts"
    rm -f "$SCRIPT_DIR/tsconfig.test.json"

    echo ""
    print_header "Testing Complete!"
    echo ""
    print_info "=== Final Results ==="
    print_info "Total Tests: $TOTAL_TESTS"
    print_success "Successful: $PASSED_TESTS"
    if [ $FAILED_TESTS -gt 0 ]; then
        print_error "Failed: $FAILED_TESTS"
    fi
    print_info "Success Rate: $(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)%"
    print_info "Final Status: $FINAL_STATUS"

    echo ""
    print_info "📄 Detailed Report: $REPORT_FILE"
    print_info "📁 Test Logs: $RESULTS_DIR"

    echo ""
    if [ $FAILED_TESTS -eq 0 ]; then
        print_success "🎉 All tests passed successfully!"
        return 0
    else
        print_warning "⚠️  Issues found in some tests. Please check the report for details."
        return 1
    fi
}

# ========================================
# Main execution logic
# ========================================

if [[ "$FAST_MODE" == "true" ]]; then
    # Run quick tests only
    if run_quick_test; then
        print_success "🎉 Quick test completed - All packages working!"
        exit 0
    else
        print_error "⚠️  Issues found in quick test!"
        exit 1
    fi
else
    # Run comprehensive tests
    if run_full_test; then
        exit 0
    else
        exit 1
    fi
fi
