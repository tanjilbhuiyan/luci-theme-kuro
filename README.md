# Kuro Theme

A dark-first OpenWrt LuCI theme. **Kuro** (黒) means black — the entire interface lives in deep matte shadow while configuration content stays crisp, calm, and readable.

Fork of [luci-theme-outline](https://github.com/tickcount/luci-theme) by [tickcount](https://github.com/tickcount), which itself is a visual overhaul of [luci-theme-aurora](https://github.com/eamonxg/luci-theme-aurora) by [eamonxg](https://github.com/eamonxg).

## Design

- **Dark-only surface** — no theme toggles, no light mode switches, no distractions
- **Matte content panels** — forms, tables, and cards stay readable on quiet charcoal surfaces
- **Minimal & focused** — restrained motion, clear states, and low visual noise

## Stack

- **Vite 8**
- **Tailwind CSS v4**
- **pnpm**

## Compatibility

- **OpenWrt** 23.05+
- **Chrome/Edge** 111+
- **Safari** 16.4+
- **Firefox** 128+

## Installation

### opkg (OpenWrt < 25.12)

```sh
cd /tmp && uclient-fetch -O luci-theme-kuro.ipk \
  https://github.com/tanjilbhuiyan/luci-theme-kuro/releases/latest/download/luci-theme-kuro_1.2.2-r20260615_all.ipk \
  && opkg install luci-theme-kuro.ipk
```

### apk (OpenWrt 25.12+)

```sh
cd /tmp && uclient-fetch -O luci-theme-kuro.apk \
  https://github.com/tanjilbhuiyan/luci-theme-kuro/releases/latest/download/luci-theme-kuro-1.2.2-r20260615.apk \
  && apk add --allow-untrusted luci-theme-kuro.apk
```

## Development

```bash
cd frontend/
pnpm install
pnpm dev       # Dev server at http://127.0.0.1:5173
pnpm build     # Production build
```

Set `VITE_OPENWRT_HOST` in `frontend/.env` to your router's IP for proxying.

See [AGENTS.md](AGENTS.md) for full development, testing, and deployment documentation.

## Credits

- **Tanjil Bhuiyan** <tanjilbhuiyan@gmail.com> — Kuro Theme
- **tickcount** — [luci-theme-outline](https://github.com/tickcount/luci-theme)
- **eamonxg** — [luci-theme-aurora](https://github.com/eamonxg/luci-theme-aurora)
- **Jo-Philipp Wich** — [luci-theme-bootstrap](https://github.com/openwrt/luci)

## License

Apache License 2.0
