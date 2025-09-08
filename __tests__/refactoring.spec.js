/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Codebase Refactoring Tests', () => {
    describe('File Structure', () => {
        test('should have separate JavaScript files for major components', () => {
            // Check if JavaScript is properly separated from HTML
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            const scriptTags = (indexContent.match(/<script[^>]*>[\s\S]*?<\/script>/g) || []).length;

            // Should have reasonable number of inline scripts (now modularized)
            expect(scriptTags).toBeLessThan(10); // Increased to account for modular JS files

            // Check for modular JS files
            const jsDir = path.resolve(__dirname, '..', 'js');
            if (fs.existsSync(jsDir)) {
                const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
                expect(jsFiles.length).toBeGreaterThan(2); // Should have multiple JS modules
            }
        });

        test('should not have duplicate or unused files', () => {
            const files = fs.readdirSync(path.resolve(__dirname, '..'));
            
            // Should not have old/backup files
            expect(files).not.toContain('index-old.html');
            expect(files).not.toContain('backup.html');
            expect(files).not.toContain('temp.html');
        });

        test('should have organized CSS structure', () => {
            const stylesExist = fs.existsSync(path.resolve(__dirname, '..', 'styles.css'));
            expect(stylesExist).toBe(true);

            // Check for modular CSS files
            const cssDir = path.resolve(__dirname, '..', 'css');
            if (fs.existsSync(cssDir)) {
                const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
                expect(cssFiles.length).toBeGreaterThan(2); // Should have multiple CSS modules

                // Check for specific CSS modules
                expect(cssFiles).toContain('main.css');
                expect(cssFiles).toContain('components.css');
                expect(cssFiles).toContain('mobile.css');
            }

            // Check if there's minimal inline CSS (should be none now)
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            const styleTags = (indexContent.match(/<style[^>]*>[\s\S]*?<\/style>/g) || []).length;
            expect(styleTags).toBe(0); // Should have no inline styles
        });
    });

    describe('Code Organization', () => {
        test('should have modular JavaScript components', () => {
            const srcDir = path.resolve(__dirname, '..', 'src');
            if (fs.existsSync(srcDir)) {
                const srcFiles = fs.readdirSync(srcDir);
                
                // Should have utility files
                expect(srcFiles).toContain('utils.js');
                
                // Should have component-specific files
                const jsFiles = srcFiles.filter(file => file.endsWith('.js'));
                expect(jsFiles.length).toBeGreaterThan(1);
            }
        });

        test('should have consistent naming conventions', () => {
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            
            // Check for consistent ID naming (kebab-case)
            const ids = indexContent.match(/id="([^"]+)"/g) || [];
            const invalidIds = ids.filter(id => {
                const idValue = id.match(/id="([^"]+)"/)[1];
                return !/^[a-z][a-z0-9-]*$/.test(idValue);
            });
            
            expect(invalidIds.length).toBeLessThan(5); // Allow some exceptions
        });

        test('should have minimal global variables', () => {
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            
            // Count global variable declarations
            const globalVars = (indexContent.match(/\b(var|let|const)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/g) || []).length;
            
            // Should have improved from original count (was ~250+, now should be less)
            expect(globalVars).toBeLessThan(250);
        });
    });

    describe('Performance Optimizations', () => {
        test('should have efficient DOM queries', () => {
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            
            // Check for cached DOM elements
            const domQueries = (indexContent.match(/document\.getElementById/g) || []).length;
            const domQuerySelectors = (indexContent.match(/document\.querySelector/g) || []).length;
            
            // Should cache DOM elements rather than querying repeatedly
            const totalQueries = domQueries + domQuerySelectors;
            expect(totalQueries).toBeLessThan(100); // Reasonable limit
        });

        test('should have minimal redundant code', () => {
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            
            // Check for duplicate function definitions
            const functionDefs = indexContent.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
            const uniqueFunctions = new Set(functionDefs);
            
            expect(functionDefs.length).toBe(uniqueFunctions.size);
        });
    });

    describe('Code Quality', () => {
        test('should have proper error handling', () => {
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            
            // Check for try-catch blocks
            const tryCatchBlocks = (indexContent.match(/try\s*{/g) || []).length;
            const asyncFunctions = (indexContent.match(/async\s+function/g) || []).length;
            
            // Should have error handling for async operations
            if (asyncFunctions > 0) {
                expect(tryCatchBlocks).toBeGreaterThan(0);
            }
        });

        test('should have consistent code formatting', () => {
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            
            // Check for consistent indentation (should use spaces)
            const lines = indexContent.split('\n');
            const tabLines = lines.filter(line => line.startsWith('\t'));
            
            // Should use spaces, not tabs
            expect(tabLines.length).toBe(0);
        });

        test('should have minimal commented-out code', () => {
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            
            // Check for commented-out code blocks
            const commentedCode = (indexContent.match(/\/\/\s*(function|const|let|var|if|for|while)/g) || []).length;
            
            // Should have minimal commented-out code
            expect(commentedCode).toBeLessThan(10);
        });
    });

    describe('Maintainability', () => {
        test('should have reasonable function sizes', () => {
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            
            // Find all functions and check their sizes
            const functionMatches = indexContent.match(/function\s+[^{]*{[^}]*}/g) || [];
            const largeFunctions = functionMatches.filter(func => {
                const lines = func.split('\n').length;
                return lines > 50; // Functions should be under 50 lines
            });
            
            expect(largeFunctions.length).toBeLessThan(5);
        });

        test('should have clear separation of concerns', () => {
            const indexContent = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
            
            // Check that UI logic is separated from business logic
            const uiMethods = (indexContent.match(/\.classList\.|\.innerHTML|\.textContent/g) || []).length;
            const businessLogic = (indexContent.match(/tasks\.|timer\.|session\./g) || []).length;
            
            // Should have reasonable separation
            const ratio = businessLogic / (uiMethods + 1);
            expect(ratio).toBeGreaterThan(0.1); // At least some business logic
        });
    });
});
