# Development Guide

This guide covers the complete development workflow for the Kuro theme, from environment setup to building production packages.

## Prerequisites

- **[Node.js v20.19+](https://nodejs.org/en/download)** - JavaScript runtime
- **pnpm** - Package manager (managed via [Corepack](https://github.com/nodejs/corepack))
- **Tailwind CSS knowledge** - Required for styling. See [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- **Network access** - Development machine must be on the same network as your OpenWrt router

## Environment Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone git@github.com:tanjilbhuiyan/luci-theme-kuro.git
cd luci-theme-kuro/.dev/

# Enable Corepack to manage pnpm version
corepack enable && corepack prepare

# Install dependencies
pnpm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set your OpenWrt device address
# VITE_OPENWRT_HOST=http://192.168.1.1
```

**Environment Variables:**

- `VITE_OPENWRT_HOST` - Your OpenWrt LuCI web interface URL (required)
- `VITE_DEV_HOST` - Development server host (default: `127.0.0.1`)
- `VITE_DEV_PORT` - Development server port (default: `5173`)

## Development Workflow

### ⚠️ Prerequisites: Install Theme on Router First

The dev server proxies page requests to your router but intercepts CSS/JS to serve local files. **This only works if the router already has the kuro theme templates installed** — otherwise the router generates HTML referencing the wrong CSS paths.

**One-time setup:**

```bash
cd .dev && pnpm build

# Copy templates to router
sftp root@192.168.1.1 <<'SFTP'
mkdir /usr/share/ucode/luci/template/themes/kuro
put ../ucode/template/themes/kuro/header.ut /usr/share/ucode/luci/template/themes/kuro/header.ut
put ../ucode/template/themes/kuro/footer.ut /usr/share/ucode/luci/template/themes/kuro/footer.ut
put ../ucode/template/themes/kuro/sysauth.ut /usr/share/ucode/luci/template/themes/kuro/sysauth.ut
SFTP

# Copy built assets to router
sftp root@192.168.1.1 <<'SFTP'
mkdir /www/luci-static/kuro
mkdir /www/luci-static/resources
put ../htdocs/luci-static/kuro/main.css /www/luci-static/kuro/main.css
put -r ../htdocs/luci-static/kuro/fonts /www/luci-static/kuro/
put -r ../htdocs/luci-static/kuro/images /www/luci-static/kuro/
put ../htdocs/luci-static/resources/menu-kuro.js /www/luci-static/resources/menu-kuro.js
SFTP

# Activate theme and restart
ssh root@192.168.1.1 "uci set luci.themes.Kuro=/luci-static/kuro && uci set luci.main.mediaurlbase=/luci-static/kuro && uci commit luci && /etc/init.d/uhttpd restart"
```

### Start Development Server

```bash
cd luci-theme-kuro/.dev/
pnpm dev
```

Then open **your local dev server** in a browser:
```
http://localhost:5173/cgi-bin/luci
```

**How it works:**

```
Browser → localhost:5173
    ├── /luci-static/kuro/main.css  →  YOUR LOCAL .dev/src/media/main.css  (live!)
    ├── /luci-static/resources/...  →  YOUR LOCAL .dev/src/resource/...    (live!)
    ├── /luci-static/kuro/fonts/... →  YOUR LOCAL .dev/public/kuro/...     (live!)
    └── /cgi-bin/luci/...           →  ROUTER 192.168.1.1 (HTML + data)
```

The router handles page logic and data. Your PC handles CSS/JS with live reload.

**Key proxy behaviors:**

1. Proxies `/cgi-bin` requests to OpenWrt device for HTML and data
2. Intercepts `/luci-static/kuro/main.css` and serves from `.dev/src/media/main.css`
3. Intercepts `/luci-static/resources/menu-kuro.js` and serves from `.dev/src/resource/menu-kuro.js`
4. Serves fonts/images from `.dev/public/kuro/`
5. All other `/luci-static/...` falls through to router proxy
6. Redirects `/` to `/cgi-bin/luci`

### Code Style and Formatting

This project uses **Prettier** for code formatting with automatic formatting on save.

**Prettier Configuration:**

- Located in `.prettierrc`
- VS Code settings in `.vscode/settings.json` enable format-on-save for CSS and JS files
- Uses `prettier-plugin-tailwindcss` to sort Tailwind CSS classes

### CSS Nesting Support

Thanks to **lightningcss**, you can freely use [CSS Nesting syntax](https://drafts.csswg.org/css-nesting/) in your stylesheets. The build process automatically compiles nested CSS into flat, browser-compatible format.

This will be compiled to standard CSS that works in all browsers.

### LuCI JavaScript API

For LuCI-specific JavaScript development, refer to the official API documentation:

- [LuCI JavaScript API Reference](http://openwrt.github.io/luci/jsapi/index.html)

### Live Reload Behavior

- **CSS changes**: Trigger full page reload via custom HMR handler
- **JS changes**: Trigger full page reload via custom HMR handler
- **Template changes** (`.ut` files): **Require building a new package and installing it on the router**

## Building for Production

### Build Command

```bash
cd luci-theme-kuro/.dev/
pnpm build
```

This compiles all assets to the production directory `htdocs/luci-static/`, which is used by LuCI during OpenWrt package compilation.

**Build Output:**

```
htdocs/luci-static/
├── kuro/
│   ├── main.css           # Minified CSS (via lightningcss)
│   ├── fonts/             # Web fonts
│   └── images/            # Logo assets
└── resources/
    └── menu-kuro.js        # Menu configuration (minified via Terser)
```

**Build Process:**

1. Vite builds CSS entry point (`src/media/main.css`)
2. Custom PostCSS plugin removes `@layer` at-rules for OpenWrt compatibility
3. Custom Vite plugin (`luci-js-compress`) minifies JS files via Terser
4. Static assets copied from `.dev/public/kuro/`

## Testing

### Dev Server (CSS/JS changes)

1. Ensure your machine is on the same network as the OpenWrt router.
2. Set `VITE_OPENWRT_HOST=http://ROUTER_IP` in `.dev/.env`.
3. Run `pnpm dev` and open `http://127.0.0.1:5173/cgi-bin/luci`.
4. CSS and JS changes auto-reload.

### Template Changes (`.ut` files)

Templates are compiled and cached by uhttpd. After editing:

```bash
# Upload templates
sftp root@ROUTER_IP <<'SFTP'
put ucode/template/themes/kuro/header.ut /usr/share/ucode/luci/template/themes/kuro/header.ut
put ucode/template/themes/kuro/footer.ut /usr/share/ucode/luci/template/themes/kuro/footer.ut
put ucode/template/themes/kuro/sysauth.ut /usr/share/ucode/luci/template/themes/kuro/sysauth.ut
SFTP

# Flush cache
MSYS_NO_PATHCONV=1 ssh root@ROUTER_IP "/etc/init.d/uhttpd restart"
```

### Full Package Install

Build the `.ipk`/`.apk` via GitHub Actions or OpenWrt SDK, then install on the router:

```bash
# opkg (OpenWrt < 25.12)
opkg install /tmp/luci-theme-kuro_1.0.0-r20260604_all.ipk

# apk (OpenWrt 25.12+)
apk add --allow-untrusted /tmp/luci-theme-kuro-1.0.0-r20260604.apk
```

## Package Compilation

### Via GitHub Actions

1. Commit your changes to the repository
2. Manually trigger the GitHub Actions workflow
3. The workflow will compile the theme package (.ipk/.apk files)

**Workflow File:** `.github/workflows/build-and-release-kuro.yml`

### Via OpenWrt SDK

```bash
# Clone SDK for your target platform
# Place this theme source in package/luci-theme-kuro/
# Run:
make package/luci-theme-kuro/compile V=s
```

## Directory Structure

```
luci-theme-kuro/
├── .dev/                           # Development environment
│   ├── docs/                       # Project documentation
│   │   └── DEVELOPMENT.md          # Development guide (this file)
│   ├── public/kuro/                 # Public static assets
│   │   ├── fonts/                  # Web fonts
│   │   └── images/                 # Theme images
│   ├── scripts/                    # Build scripts
│   │   └── clean.js                # Build cleanup utility
│   ├── src/                        # Source code
│   │   ├── assets/icons/           # SVG icons
│   │   ├── media/                  # CSS entry points
│   │   │   └── main.css            # Main stylesheet (Tailwind CSS)
│   │   └── resource/               # JavaScript resources
│   │       └── menu-kuro.js         # Menu logic
│   ├── .env.example                # Environment variables template
│   ├── .prettierrc                 # Prettier configuration
│   ├── package.json                # Node.js dependencies
│   ├── pnpm-lock.yaml              # pnpm lock file
│   └── vite.config.ts              # Vite configuration with custom plugins
├── .github/                        # GitHub configuration
│   ├── ISSUE_TEMPLATE/             # Issue templates
│   └── workflows/                  # GitHub Actions workflows
├── .vscode/                        # VS Code workspace settings
│   └── settings.json               # Auto-format on save settings
├── htdocs/luci-static/             # Build output (generated by Vite)
│   ├── kuro/                        # Theme CSS and assets
│   │   ├── fonts/                  # Built font files
│   │   ├── images/                 # Built images
│   │   └── main.css                # Compiled CSS
│   └── resources/                  # Built JavaScript modules
│       └── menu-kuro.js             # Minified menu logic
├── root/etc/uci-defaults/          # OpenWrt system integration
│   └── 30_luci-theme-kuro           # Theme auto-setup script
├── ucode/template/themes/kuro/      # LuCI ucode templates
│   ├── header.ut                   # Header template
│   ├── footer.ut                   # Footer template
│   └── sysauth.ut                  # Login page template
├── LICENSE                         # Apache License 2.0
├── Makefile                        # OpenWrt package Makefile
└── README.md                       # English documentation
```

## Tools and Technologies

- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vite](https://vitejs.dev/)** - Build tool and development server
  **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[lightningcss](https://lightningcss.dev/)** - CSS minifier
- **[Terser](https://terser.org/)** - JavaScript minifier
- **[Prettier](https://prettier.io/)** - Code formatter
- **[prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)** - Tailwind class sorting
