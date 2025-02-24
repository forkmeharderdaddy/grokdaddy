export const CODING_EXTENSIONS = new Set<string>([
    // Common Programming Languages
    '.c', '.cpp', '.cxx', '.cc', '.h', '.hpp', '.hxx', // C/C++
    '.cs', // C#
    '.java', // Java
    '.py', // Python
    '.js', '.jsx', // JavaScript, JSX
    '.ts', '.tsx', // TypeScript, TSX
    '.go', // Go
    '.rs', // Rust
    '.rb', // Ruby
    '.php', // PHP
    '.swift', // Swift
    '.kt', '.kts', // Kotlin
    '.scala', // Scala
    '.pl', '.pm', // Perl
    '.lua', // Lua
    '.r', // R
    '.m', // MATLAB/Objective-C
    '.dart', // Dart
    '.erl', '.hrl', // Erlang
    '.hs', '.lhs', // Haskell
    '.jl', // Julia
    '.clj', '.cljs', '.cljc', // Clojure
    '.groovy', // Groovy
    '.vb', // Visual Basic

    // Web Development
    '.html', '.htm', // HTML
    '.css', // CSS
    '.scss', '.sass', '.less', // CSS Preprocessors
    '.json', // JSON (often code-adjacent configs)
    '.xml', // XML (used in code-like contexts)

    // Scripting
    '.sh', // Bash/Shell
    '.bash', // Bash
    '.zsh', // Zsh
    '.fish', // Fish Shell
    '.ps1', // PowerShell
    '.bat', '.cmd', // Windows Batch

    // Markup and Templating
    '.md', // Markdown (common in docs/code)
    '.pug', '.jade', // Pug/Jade
    '.ejs', // EJS
    '.hbs', // Handlebars
    '.erb', // Ruby ERB
    '.twig', // Twig

    // Configuration and Build Files
    '.yml', '.yaml', // YAML
    '.toml', // TOML
    '.ini', // INI
    '.cfg', '.conf', // Config files
    '.makefile', // Makefile (no extension often, but included)
    '.gradle', // Gradle
    '.dockerfile', // Dockerfile (no extension often, but included)
    '.lock', // Lockfiles (e.g., package-lock.json companions)

    // Query Languages
    '.sql', // SQL
    '.graphql', '.gql', // GraphQL

    // Miscellaneous
    '.asm', '.s', // Assembly
    '.f', '.for', '.f90', // Fortran
    '.pas', // Pascal
    '.ada', '.adb', '.ads', // Ada
    '.vhd', '.vhdl', // VHDL
    '.verilog', '.v', // Verilog
    '.nim', // Nim
    '.d', // D
    '.elm', // Elm
    '.ex', '.exs', // Elixir
    '.fs', '.fsi', '.fsx', // F#
]);